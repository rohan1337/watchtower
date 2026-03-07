import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { RedisService } from "../redis/redis.service";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class EscalationService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly redisService: RedisService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(EscalationService.name);
	}

	private async getRateFromRedis(incidentId: string) {
		const redis = this.redisService.getClient();
		const key = `incident:${incidentId}:rate`;

		const now = Date.now();
		const member = `${now}-${Math.random()}`;

		const pipeline = redis.pipeline();
		pipeline.zadd(key, now, member);
		pipeline.zremrangebyscore(key, 0, now - 60000);
		pipeline.zcard(key);
		pipeline.expire(key, 120);

		const results = await pipeline.exec();

		if (!results || results.some(([err]) => err)) {
			this.logger.error(
				{ incidentId },
				"Redis pipeline failed while calculating rate",
			);
			throw new Error("Redis pipeline failed");
		}

		return results[2][1] as number;
	}

	async evaluate(input: { id: string }) {
		this.logger.debug({ incidentId: input.id }, "Evaluating escalation");

		const incident = await this.prisma.incident.findUnique({
			where: { id: input.id },
		});

		if (!incident) {
			this.logger.warn(
				{ incidentId: input.id },
				"Incident not found during escalation",
			);
			return;
		}

		const redis = this.redisService.getClient();

		let rate: number;

		try {
			rate = await this.getRateFromRedis(incident.id);
		} catch (err) {
			this.logger.error(
				{ incidentId: incident.id },
				"Redis unavailable, falling back to DB counter",
			);
			rate = incident.alertCount;
		}

		this.logger.debug(
			{ incidentId: incident.id, rate },
			"Calculated incident alert rate",
		);

		if (rate >= 15 && incident.severity !== "CRITICAL") {
			this.logger.warn(
				{ incidentId: incident.id, rate },
				"Escalating incident to CRITICAL",
			);

			await this.prisma.incident.update({
				where: { id: incident.id },
				data: { severity: "CRITICAL" },
			});

			try {
				await redis.publish(
					"incident-escalated",
					JSON.stringify({
						tenantId: incident.tenantId,
						incidentId: incident.id,
						severity: "CRITICAL",
					}),
				);

				this.logger.debug(
					{ incidentId: incident.id },
					"Realtime escalation published",
				);
			} catch (err) {
				this.logger.warn(
					{ incidentId: incident.id },
					"Failed to publish realtime escalation update",
				);
			}

			return;
		}

		if (rate >= 8 && incident.severity === "MEDIUM") {
			this.logger.warn(
				{ incidentId: incident.id, rate },
				"Escalating incident to HIGH",
			);

			await this.prisma.incident.update({
				where: { id: incident.id },
				data: { severity: "HIGH" },
			});

			try {
				await redis.publish(
					"incident-channel",
					JSON.stringify({
						incidentId: incident.id,
						type: "ESCALATED",
						severity: "HIGH",
					}),
				);

				this.logger.debug(
					{ incidentId: incident.id },
					"Realtime escalation published",
				);
			} catch (err) {
				this.logger.warn(
					{ incidentId: incident.id },
					"Failed to publish realtime update",
				);
			}
		}
	}
}
