import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { Logger } from "@nestjs/common";

async function bootstrap() {
	const logger = new Logger("Bootstrap");

	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			stopAtFirstError: true, // THIS REPLICATES .bail()
			transform: true, // REQUIRED FOR @Transform() TO WORK
			exceptionFactory: (errors) => {
				const formatted = errors.map((err) => ({
					field: err.property,
					errors: Object.values(err.constraints ?? {}),
					children: err.children ?? [],
				}));
				return new BadRequestException({ errors: formatted });
			},
		}),
	);

	app.use(cookieParser());

	app.enableCors({
		origin: [process.env.FRONTEND_URL],
		credentials: true,
	});

	await app.listen(process.env.PORT ?? 3001);

	logger.log(
		`Authentication Service is running on port ${process.env.PORT ?? 3001}`,
	);
}
bootstrap();
