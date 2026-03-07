import { Worker } from "bullmq";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";
import { EscalationService } from "../incident/escalation.service";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class EscalationProcessor implements OnModuleInit {
	private worker: Worker;

	constructor(
		private readonly redisService: RedisService,
		private readonly escalationService: EscalationService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(EscalationProcessor.name);
	}

	onModuleInit() {
		const redis = this.redisService.getQueueClient();

		this.logger.info("Starting escalation worker");

		this.worker = new Worker(
			"escalation-queue",
			async (job) => {
				const { incidentId } = job.data;

				this.logger.debug(
					{ jobId: job.id, incidentId },
					"Processing escalation job",
				);

				await this.escalationService.evaluate({
					id: incidentId,
				});
			},
			{
				connection: redis,
			},
		);

		// Job lifecycle listeners
		this.worker.on("active", (job) => {
			this.logger.debug(
				{ jobId: job.id, incidentId: job.data.incidentId },
				"Job started processing",
			);
		});

		// Worker lifecycle events
		this.worker.on("completed", (job) => {
			this.logger.info(
				{ jobId: job.id, incidentId: job.data.incidentId },
				"Escalation job completed",
			);
		});

		this.worker.on("failed", (job, err) => {
			this.logger.error(
				{
					jobId: job?.id,
					incidentId: job?.data?.incidentId,
					err,
				},
				"Escalation job failed",
			);
		});

		this.worker.on("stalled", (jobId) => {
			this.logger.warn({ jobId }, "Escalation job stalled");
		});

		this.worker.on("error", (err) => {
			this.logger.error({ err }, "Escalation worker error");
		});
	}
}
