import { Injectable, OnModuleInit } from "@nestjs/common";
import Redis from "ioredis";
import { RealtimeGateway } from "./realtime.gateway";
import { PinoLogger } from "nestjs-pino";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class RealtimeSubscriber implements OnModuleInit {
	private subscriber: Redis;

	constructor(
		private readonly gateway: RealtimeGateway,
		private readonly redisService: RedisService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(RealtimeSubscriber.name);
	}

	onModuleInit() {
		// 🔥 Use shared Redis subscriber connection
		this.subscriber = this.redisService.getSubscriber();

		this.logger.info("Realtime Redis subscriber started");

		this.subscriber.subscribe("alert-created");
		this.subscriber.subscribe("incident-escalated");

		this.logger.info(
			{ channels: ["alert-created", "incident-escalated"] },
			"Subscribed to realtime channels",
		);

		this.subscriber.on("message", (channel, message) => {
			try {
				const parsed = JSON.parse(message);

				this.logger.debug(
					{ channel, tenantId: parsed.tenantId },
					"Realtime message received",
				);

				if (channel === "alert-created") {
					this.gateway.server
						.to(parsed.tenantId)
						.emit("alert-created", parsed);

					this.logger.debug(
						{ tenantId: parsed.tenantId },
						"Broadcasted alert-created event",
					);
				}

				if (channel === "incident-escalated") {
					this.gateway.server
						.to(parsed.tenantId)
						.emit("incident-escalated", parsed);

					this.logger.debug(
						{ tenantId: parsed.tenantId },
						"Broadcasted incident-escalated event",
					);
				}
			} catch (error) {
				this.logger.error(
					{ err: error, channel, message },
					"Failed to process realtime message",
				);
			}
		});

		this.subscriber.on("error", (error) => {
			this.logger.error({ err: error }, "Redis subscriber error");
		});
	}
}
