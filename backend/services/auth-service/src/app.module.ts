import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
	imports: [AuthModule, ScheduleModule.forRoot()],
})
export class AppModule {}
