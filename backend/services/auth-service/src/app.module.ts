import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { ScheduleModule } from "@nestjs/schedule";
import { TenantModule } from "./modules/tenant/tenant.module";
import { LoggerModule } from "nestjs-pino";
import { APP_FILTER } from "@nestjs/core";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import * as crypto from "crypto";

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
		AuthModule,
		TenantModule,
		ScheduleModule.forRoot(),
	],
	providers: [
		{
			provide: APP_FILTER,
			useClass: GlobalExceptionFilter,
		},
	],
})
export class AppModule {}
