import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { IncidentModule } from "./modules/incident/incident.module";
import { AlertModule } from "./modules/alert/alert.module";
import { EventModule } from "./modules/event/event.module";
import { ScheduleModule } from "@nestjs/schedule";
import { IntegrationModule } from "./modules/integration/integration.module";
import { ThresholdModule } from "./modules/threshold/threshold.module";
import { RedisModule } from "./modules/redis/redis.module";
import { QueueModule } from "./modules/queue/queue.module";
import { RealtimeModule } from "./modules/realtime/realtime.module";
import { LoggerModule } from "nestjs-pino";
import { APP_FILTER } from "@nestjs/core";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { HealthModule } from "./modules/health/health.module";
import { MetricsModule } from "./modules/metrics/metrics.module";
import * as crypto from "crypto";

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
				// request id for tracing
				genReqId: (req) => {
					const existing = req.headers["x-request-id"];
					if (existing) return existing;

					return crypto.randomUUID();
				},
				// attach request id to response header
				customProps: (req) => ({
					reqId: req.id,
				}),
			},
		}),
		IncidentModule,
		AlertModule,
		EventModule,
		ScheduleModule.forRoot(),
		IntegrationModule,
		ThresholdModule,
		RedisModule,
		QueueModule,
		RealtimeModule,
		HealthModule,
		MetricsModule,
	],
	providers: [
		{
			provide: APP_FILTER,
			useClass: GlobalExceptionFilter,
		},
	],
})
export class AppModule {}
