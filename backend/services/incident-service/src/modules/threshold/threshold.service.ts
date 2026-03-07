import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { RedisService } from "../redis/redis.service";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class ThresholdService {
	constructor(
		private prisma: PrismaService,
		private redisService: RedisService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(ThresholdService.name);
	}

	async getThresholdConfig(tenantId: string, service: string | null) {
		const redis = this.redisService.getClient();
		const key = `threshold:${tenantId}:${service ?? "GLOBAL"}`;

		try {
			const cached = await redis.get(key);

			if (cached) {
				this.logger.debug(
					{ tenantId, service },
					"Threshold config cache hit",
				);

				return JSON.parse(cached);
			}

			this.logger.debug(
				{ tenantId, service },
				"Threshold config cache miss",
			);
		} catch (err) {
			this.logger.error(
				{ err, tenantId, service },
				"Redis unavailable. Skipping cache layer",
			);
		}

		this.logger.debug(
			{ tenantId, service },
			"Fetching threshold config from database",
		);

		let config = await this.prisma.thresholdConfig.findFirst({
			where: { tenantId, service },
		});

		if (!config) {
			config = await this.prisma.thresholdConfig.findFirst({
				where: { tenantId, service: null },
			});
		}

		try {
			if (config) {
				await redis.set(key, JSON.stringify(config), "EX", 300);

				this.logger.debug(
					{ tenantId, service },
					"Threshold config cached",
				);
			}
		} catch (err) {
			this.logger.warn({ tenantId, service }, "Redis caching skipped");
		}

		return config;
	}

	async invalidateCache(tenantId: string, service: string | null) {
		const key = `threshold:${tenantId}:${service ?? "GLOBAL"}`;

		try {
			const redis = this.redisService.getClient();

			await redis.del(key);

			this.logger.debug(
				{ tenantId, service },
				"Threshold cache invalidated",
			);
		} catch (err) {
			this.logger.warn(
				{ tenantId, service },
				"Redis invalidation skipped",
			);
		}
	}

	async shouldCreateIncident(alert: any): Promise<boolean> {
		this.logger.debug(
			{
				tenantId: alert.tenantId,
				service: alert.service,
				severity: alert.severity,
			},
			"Evaluating incident creation threshold",
		);

		const config = await this.getThresholdConfig(
			alert.tenantId,
			alert.service,
		);

		const highThreshold = config?.highCount ?? 1;

		if (alert.severity === "HIGH" || alert.severity === "CRITICAL") {
			this.logger.debug(
				{ severity: alert.severity },
				"High severity alert triggers incident",
			);
			return true;
		}

		if (alert.severity === "MEDIUM") {
			const decision = highThreshold <= 1;

			this.logger.debug(
				{ severity: alert.severity, highThreshold, decision },
				"Medium severity threshold evaluation",
			);

			return decision;
		}

		this.logger.debug(
			{ severity: alert.severity },
			"Low severity alert ignored for incident creation",
		);

		return false;
	}
}
