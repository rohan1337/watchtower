import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";

async function bootstrap() {
	const logger = new Logger("Bootstrap");

	const app = await NestFactory.createMicroservice(AppModule, {
		transport: Transport.REDIS,
		options: {
			host: "localhost",
			port: 6379,
		},
		bufferLogs: true,
	});

	await app.listen();
	logger.log(`Notification Service is running`);
}

bootstrap();
