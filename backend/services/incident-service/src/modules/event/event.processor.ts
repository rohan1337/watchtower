import { Injectable } from "@nestjs/common";
import { AlertService } from "../alert/alert.service";
import { IncidentService } from "../incident/incident.service";
import { ThresholdService } from "../threshold/threshold.service";
import { QueueService } from "../queue/queue.service";
import { RedisService } from "../redis/redis.service";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class EventProcessor {
	constructor(
		private readonly alertService: AlertService,
		private readonly incidentService: IncidentService,
		private readonly thresholdService: ThresholdService,
		private readonly queueService: QueueService,
		private readonly redisService: RedisService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(EventProcessor.name);
	}

	private async publishAlert(alert: any) {
		try {
			const redis = this.redisService.getClient();

			await redis.publish(
				"alert-created",
				JSON.stringify({
					tenantId: alert.tenantId,
					alert: {
						id: alert.id,
						message: alert.message,
						severity: alert.severity,
						source: alert.source,
						incidentId: alert.incidentId ?? null,
						createdAt: alert.createdAt,
					},
				}),
			);

			this.logger.debug(
				{ alertId: alert.id, tenantId: alert.tenantId },
				"Realtime alert published",
			);
		} catch (err) {
			this.logger.warn(
				{ alertId: alert?.id, error: err },
				"Realtime publish failed",
			);
		}
	}

	async process(event: any) {
		this.logger.info(
			{
				eventId: event.id,
				tenantId: event.tenantId,
				source: event.source,
			},
			"Processing event",
		);

		// 1️⃣ Create alert
		const alert = await this.alertService.createFromEvent(event);

		this.logger.debug({ alertId: alert.id }, "Alert created from event");

		// 2️⃣ Decide incident
		const shouldCreate =
			await this.thresholdService.shouldCreateIncident(alert);

		if (!shouldCreate) {
			this.logger.debug(
				{ alertId: alert.id },
				"Threshold not met, standalone alert",
			);

			await this.publishAlert(alert);
			return;
		}

		// 3️⃣ Create or attach incident
		const incident = await this.incidentService.createOrAttach(
			alert,
			event,
		);

		this.logger.info(
			{ incidentId: incident.id, alertId: alert.id },
			"Incident created or attached",
		);

		// publish enriched alert
		await this.publishAlert({
			...alert,
			incidentId: incident.id,
		});

		// 4️⃣ Queue escalation
		await this.queueService.addEscalationJob(incident.id);

		this.logger.debug({ incidentId: incident.id }, "Escalation job queued");
	}
}
