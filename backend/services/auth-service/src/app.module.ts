import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { ScheduleModule } from "@nestjs/schedule";
import { TenantModule } from "./modules/tenant/tenant.module";

@Module({
	imports: [AuthModule, TenantModule, ScheduleModule.forRoot()],
})
export class AppModule {}
