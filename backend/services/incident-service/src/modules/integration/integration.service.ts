import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { EventProcessor } from "../event/event.processor";
import { Severity, EventType } from "@prisma/client";
import { RedisService } from "../redis/redis.service";
import * as crypto from "crypto";

@Injectable()
export class IntegrationService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly eventProcessor: EventProcessor,
		private readonly redisService: RedisService,
	) {}

	/* ----------------------------------------
     🔐 API KEY MANAGEMENT
	-----------------------------------------*/

	private generateApiKey(): string {
		return crypto.randomBytes(32).toString("hex");
	}

	private hashKey(key: string): string {
		return crypto.createHash("sha256").update(key).digest("hex");
	}

	async createIntegration(dto: {
		name: string;
		provider: string;
		tenantId: string;
	}) {
		const rawKey = this.generateApiKey();
		const hashedKey = this.hashKey(rawKey);

		const integration = await this.prisma.integration.create({
			data: {
				name: dto.name,
				provider: dto.provider as any,
				tenantId: dto.tenantId,
				apiKey: hashedKey,
			},
		});

		return {
			...integration,
			apiKey: rawKey, // shown once
		};
	}

	private async validateApiKey(rawKey: string) {
		const hashed = this.hashKey(rawKey);

		const keyRecord = await this.prisma.integrationKey.findFirst({
			where: {
				hashedKey: hashed,
				isActive: true,
				OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
			},
			include: { integration: true },
		});

		if (!keyRecord || !keyRecord.integration.isActive) {
			throw new UnauthorizedException("Invalid API key");
		}

		return keyRecord.integration;
	}

	/* ----------------------------------------
     🌐 WEBHOOK ENTRY POINT
	-----------------------------------------*/

	async handleWebhook(apiKey: string, payload: any) {
		const integration = await this.validateApiKey(apiKey);

		// 🔥 Rate limit BEFORE processing
		await this.rateLimitIntegration(integration.id);

		const normalizedEvent = this.normalizePayload(payload, integration);

		// 🔥 Persist event (audit trail)
		const event = await this.prisma.event.create({
			data: normalizedEvent,
		});

		// 🔥 Process persisted event
		await this.eventProcessor.process(event);

		return event;
	}

	/* ----------------------------------------
     🧠 PAYLOAD NORMALIZATION
	-----------------------------------------*/

	private normalizePayload(payload: any, integration: any) {
		return {
			type: this.safeEnum(payload?.type, EventType, EventType.ERROR),
			source: integration.provider,
			message: payload?.message ?? "Unknown error",
			service: payload?.service ?? "unknown-service",
			severity: this.safeEnum(
				payload?.severity,
				Severity,
				Severity.MEDIUM,
			),
			tenantId: integration.tenantId,
		};
	}

	private safeEnum<T>(value: any, enumObj: T, fallback: any) {
		return Object.values(enumObj as any).includes(value) ? value : fallback;
	}

	/* ----------------------------------------
     🧠 RATE LIMITING
	-----------------------------------------*/

	private async rateLimitIntegration(integrationId: string) {
		const redis = this.redisService.getClient();

		const key = `integration:${integrationId}:rate`;
		const now = Date.now();
		const windowMs = 60 * 1000; // 1 minute
		const limit = 100; // 100 requests per minute

		const pipeline = redis.pipeline();

		// Add request timestamp
		pipeline.zadd(key, now, `${now}-${Math.random()}`);

		// Remove old timestamps
		pipeline.zremrangebyscore(key, 0, now - windowMs);

		// Count current requests
		pipeline.zcard(key);

		// Expire key automatically
		pipeline.expire(key, 120);

		const results = await pipeline.exec();

		if (!results || results.some(([err]) => err)) {
			throw new Error("Redis rate limit failure");
		}

		const currentCount = results[2][1] as number;

		if (currentCount > limit) {
			throw new UnauthorizedException(
				"Rate limit exceeded. Try again later.",
			);
		}
	}

	async rotateApiKey(
		integrationId: string,
		tenantId: string,
		graceMinutes = 5,
	) {
		const integration = await this.prisma.integration.findFirst({
			where: { id: integrationId, tenantId },
			include: { keys: true },
		});

		if (!integration) {
			throw new BadRequestException("Integration not found");
		}

		const newRawKey = this.generateApiKey();
		const newHashed = this.hashKey(newRawKey);

		// 1️⃣ Demote current primary
		await this.prisma.integrationKey.updateMany({
			where: {
				integrationId,
				isPrimary: true,
			},
			data: {
				isPrimary: false,
				expiresAt: new Date(Date.now() + graceMinutes * 60 * 1000),
			},
		});

		// 2️⃣ Create new primary
		await this.prisma.integrationKey.create({
			data: {
				integrationId,
				hashedKey: newHashed,
				isPrimary: true,
				isActive: true,
			},
		});

		return {
			message: "New key generated. Old key will expire shortly.",
			apiKey: newRawKey,
		};
	}

	async toggleIntegration(
		integrationId: string,
		tenantId: string,
		isActive: boolean,
	) {
		const integration = await this.prisma.integration.findFirst({
			where: {
				id: integrationId,
				tenantId,
			},
		});

		if (!integration) {
			throw new BadRequestException("Integration not found");
		}

		return this.prisma.integration.update({
			where: { id: integrationId },
			data: { isActive },
		});
	}

	async listByTenant(tenantId: string) {
		return this.prisma.integration.findMany({
			where: { tenantId },
			include: {
				keys: {
					where: { isActive: true },
					orderBy: { createdAt: "desc" },
				},
			},
		});
	}
}
