import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class IntegrationCleanupService {
	private readonly logger = new Logger(IntegrationCleanupService.name);

	constructor(private readonly prisma: PrismaService) {}

	// 🔥 Runs every minute
	@Cron(CronExpression.EVERY_MINUTE)
	async deactivateExpiredKeys() {
		const now = new Date();

		const result = await this.prisma.integrationKey.updateMany({
			where: {
				expiresAt: { lt: now },
				isActive: true,
			},
			data: {
				isActive: false,
			},
		});

		if (result.count > 0) {
			this.logger.log(
				`Deactivated ${result.count} expired integration keys`,
			);
		}
	}
}
