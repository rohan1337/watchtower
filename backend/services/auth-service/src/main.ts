import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { Logger } from "nestjs-pino";

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});

	// Use Pino as Nest logger
	app.useLogger(app.get(Logger));

	const logger = app.get(Logger);

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

	// 👇 get Express instance
	const expressApp = app.getHttpAdapter().getInstance();

	// 👇 now this works
	expressApp.set("trust proxy", 1);

	await app.listen(process.env.PORT ?? 3001);

	logger.log(
		{
			service: "auth-service",
			port: process.env.PORT ?? 3001,
			env: process.env.NODE_ENV,
		},
		"Service started",
	);
}
bootstrap();
