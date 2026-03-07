import { Injectable, OnModuleInit } from "@nestjs/common";
import Redis from "ioredis";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class RedisService implements OnModuleInit {
	private client: Redis;
	private queueClient: Redis;
	private subscriber: Redis;

	constructor(private readonly logger: PinoLogger) {
		this.logger.setContext(RedisService.name);
	}

	onModuleInit() {
		this.logger.info("Initializing Redis connections");

		const redisHost = process.env.REDIS_HOST || "localhost";
		const redisPort = 6379;

		// 🔹 General purpose client (caching, normal commands)
		this.client = new Redis({
			host: redisHost,
			port: redisPort,
		});

		// 🔹 BullMQ client (must disable retries)
		this.queueClient = new Redis({
			host: redisHost,
			port: redisPort,
			maxRetriesPerRequest: null,
		});

		// 🔹 Pub/Sub subscriber
		this.subscriber = new Redis({
			host: redisHost,
			port: redisPort,
		});

		this.client.on("connect", () => {
			this.logger.info("Redis cache client connected");
		});

		this.queueClient.on("connect", () => {
			this.logger.info("Redis queue client connected");
		});

		this.subscriber.on("connect", () => {
			this.logger.info("Redis subscriber connected");
		});

		this.client.on("error", (err) => {
			this.logger.error({ err }, "Redis cache client error");
		});

		this.queueClient.on("error", (err) => {
			this.logger.error({ err }, "Redis queue client error");
		});

		this.subscriber.on("error", (err) => {
			this.logger.error({ err }, "Redis subscriber error");
		});
	}

	// 🔹 Caching / general Redis usage
	getClient(): Redis {
		return this.client;
	}

	// 🔹 BullMQ queues & workers
	getQueueClient(): Redis {
		return this.queueClient;
	}

	// 🔹 Pub/Sub
	getSubscriber(): Redis {
		return this.subscriber;
	}
}
