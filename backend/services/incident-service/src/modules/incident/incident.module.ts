import { Module } from "@nestjs/common";
import { IncidentController } from "./incident.controller";
import { IncidentService } from "./incident.service";
import { PassportModule } from "@nestjs/passport";
import { PrismaService } from "src/database/prisma.service";
import { JwtStrategy } from "../../common/strategies/jwt.strategy";
import { HttpModule } from "@nestjs/axios";
import { AutoResolveService } from "./auto-resolve.service";
import { EscalationService } from "./escalation.service";
import { QueueModule } from "../queue/queue.module";
import { RedisModule } from "../redis/redis.module";

@Module({
	imports: [PassportModule, HttpModule, QueueModule, RedisModule],
	controllers: [IncidentController],
	providers: [
		IncidentService,
		PrismaService,
		JwtStrategy,
		AutoResolveService,
		EscalationService,
	],
	exports: [IncidentService, EscalationService],
})
export class IncidentModule {}
