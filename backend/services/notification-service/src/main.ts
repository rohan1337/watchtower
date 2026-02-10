import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import { NotificationModule } from "./modules/notification/notification.module";

async function bootstrap() {
	const app = await NestFactory.createMicroservice(NotificationModule, {
		transport: Transport.REDIS,
		options: {
			host: "localhost",
			port: 6379,
		},
	});
	
	await app.listen();
	console.log("Notification Service is running");
}

bootstrap();
