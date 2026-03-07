import { Module } from "@nestjs/common";
import { EventController } from "./event.controller";
import { EventService } from "./event.service";
import { EventProcessor } from "./event.processor";
import { PrismaService } from "../../database/prisma.service";
import { AlertModule } from "../alert/alert.module";
import { IncidentModule } from "../incident/incident.module";
import { ThresholdModule } from "../threshold/threshold.module";
import { QueueModule } from "../queue/queue.module";
import { RedisModule } from "../redis/redis.module";

@Module({
	imports: [
		AlertModule,
		IncidentModule,
		ThresholdModule,
		QueueModule,
		RedisModule,
	],
	controllers: [EventController],
	providers: [EventService, EventProcessor, PrismaService],
	exports: [EventProcessor],
})
export class EventModule {}
