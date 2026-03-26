import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { PrismaService } from "src/database/prisma.service";

@Module({
	imports: [TerminusModule],
	controllers: [HealthController],
	providers: [PrismaService],
	exports: [PrismaService],
})
export class HealthModule {}
