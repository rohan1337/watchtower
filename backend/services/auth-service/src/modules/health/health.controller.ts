import { Controller, Get } from "@nestjs/common";
import {
	HealthCheck,
	HealthCheckService,
	MemoryHealthIndicator,
} from "@nestjs/terminus";
import { PrismaService } from "../../database/prisma.service";

@Controller()
export class HealthController {
	constructor(
		private health: HealthCheckService,
		private prisma: PrismaService,
		private memory: MemoryHealthIndicator,
	) {}

	// Liveness probe
	@Get("health")
	healthCheck() {
		return { status: "ok" };
	}

	// Readiness probe
	@Get("ready")
	@HealthCheck()
	async readiness() {
		return this.health.check([
			async () => {
				await this.prisma.$queryRaw`SELECT 1`;
				return { database: { status: "up" } };
			},
			() => this.memory.checkHeap("memory_heap", 200 * 1024 * 1024),
		]);
	}
}
