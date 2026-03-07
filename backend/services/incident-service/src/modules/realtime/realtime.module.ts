import { Module } from "@nestjs/common";
import { RealtimeGateway } from "./realtime.gateway";
import { RealtimeSubscriber } from "./realtime.subscriber";
import { RedisModule } from "../redis/redis.module";
import { JwtService } from "@nestjs/jwt";

@Module({
	imports: [RedisModule],
	providers: [RealtimeGateway, RealtimeSubscriber, JwtService],
})
export class RealtimeModule {}
