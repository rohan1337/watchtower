import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { ScheduleModule } from "@nestjs/schedule";
import { TenantModule } from "./modules/tenant/tenant.module";
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
		AuthModule,
		TenantModule,
		ScheduleModule.forRoot(),
	],
})
export class AppModule {}
