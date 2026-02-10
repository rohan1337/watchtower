import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
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

	console.log("Authentication Service is running at port", process.env.PORT);
}
bootstrap();
