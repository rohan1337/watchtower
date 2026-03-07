import { Module } from "@nestjs/common";
import { QueueService } from "./queue.service";
import { EscalationProcessor } from "./escalation.processor";
import { RedisModule } from "../redis/redis.module";
import { EscalationService } from "../incident/escalation.service";
import { PrismaService } from "src/database/prisma.service";

@Module({
	imports: [RedisModule],
	providers: [
		QueueService,
		EscalationProcessor,
		EscalationService,
		PrismaService,
	],
	exports: [QueueService],
})
export class QueueModule {}
