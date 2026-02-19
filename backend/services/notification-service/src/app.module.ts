import { Module } from "@nestjs/common";
import { NotificationModule } from "./modules/notification/notification.module";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";

@Module({
	imports: [
		LoggerModule.forRoot({
			pinoHttp: {
				level: process.env.NODE_ENV === "production" ? "info" : "debug",
				transport:
					process.env.NODE_ENV !== "production"
						? {
								target: "pino-pretty",
								options: {
									singleLine: true,
									colorize: true,
								},
							}
						: undefined,
			},
		}),
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ".env",
		}),
		NotificationModule,
	],
})
export class AppModule {}
