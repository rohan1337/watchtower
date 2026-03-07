import { Module } from "@nestjs/common";
import { IntegrationController } from "./integration.controller";
import { IntegrationService } from "./integration.service";
import { IntegrationCleanupService } from "./integration-cleanup.service";
import { PrismaService } from "src/database/prisma.service";
import { EventModule } from "../event/event.module";
import { RedisModule } from "../redis/redis.module";

@Module({
	imports: [EventModule, RedisModule],
	controllers: [IntegrationController],
	providers: [IntegrationService, IntegrationCleanupService, PrismaService],
})
export class IntegrationModule {}
