import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { IncidentModule } from "./modules/incident/incident.module";
import { AlertModule } from "./modules/alert/alert.module";
import { LoggerModule } from "nestjs-pino";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ".env",
		}),
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
		IncidentModule,
		AlertModule,
	],
})
export class AppModule {}
