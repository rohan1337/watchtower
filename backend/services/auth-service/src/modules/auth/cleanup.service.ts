import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../../database/prisma.service";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class CleanupService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(CleanupService.name);
	}

	@Cron("0 */2 * * *")
	async cleanupExpired() {
		this.logger.info("Starting email verification cleanup job");

		try {
			const deleted = await this.prisma.emailVerification.deleteMany({
				where: {
					expiresAt: { lt: new Date() },
				},
			});

			this.logger.info(
				{ deletedCount: deleted.count },
				"Cleanup job completed",
			);
		} catch (error) {
			this.logger.error({ err: error }, "Cleanup job failed");
		}
	}
}
