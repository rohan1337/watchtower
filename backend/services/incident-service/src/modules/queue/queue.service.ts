import { Injectable, OnModuleInit } from "@nestjs/common";
import { Queue } from "bullmq";
import { RedisService } from "../redis/redis.service";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class QueueService implements OnModuleInit {
	private escalationQueue: Queue;

	constructor(
		private redisService: RedisService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(QueueService.name);
	}

	onModuleInit() {
		const redis = this.redisService.getQueueClient();

		this.escalationQueue = new Queue("escalation-queue", {
			connection: redis,
		});

		this.logger.info("Escalation queue initialized");
	}

	async addEscalationJob(incidentId: string) {
		this.logger.debug({ incidentId }, "Adding escalation job to queue");

		const job = await this.escalationQueue.add(
			"escalate",
			{ incidentId },
			{
				attempts: 5,
				backoff: {
					type: "exponential",
					delay: 5000,
				},
			},
		);

		this.logger.info(
			{ jobId: job.id, incidentId },
			"Escalation job added to queue",
		);
	}
}
