import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";
import { Logger } from "nestjs-pino";

async function bootstrap() {
	const app = await NestFactory.createMicroservice(AppModule, {
		transport: Transport.REDIS,
		options: {
			host: process.env.REDIS_HOST,
			port: process.env.REDIS_PORT || 6379,
		},
		bufferLogs: true,
	});

	// Use Pino as Nest logger
	app.useLogger(app.get(Logger));

	const logger = app.get(Logger);

	await app.listen();

	logger.log(
		{
			service: "notification-service",
			env: process.env.NODE_ENV,
		},
		"Service started",
	);
}

bootstrap();
