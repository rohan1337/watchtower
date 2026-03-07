import { Module } from "@nestjs/common";
import { ThresholdService } from "./threshold.service";
import { PrismaService } from "src/database/prisma.service";
import { RedisModule } from "../redis/redis.module";

@Module({
	imports: [RedisModule],
	providers: [ThresholdService, PrismaService],
	exports: [ThresholdService],
})
export class ThresholdModule {}
