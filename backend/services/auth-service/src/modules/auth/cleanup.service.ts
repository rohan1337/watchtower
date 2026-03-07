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
		const now = new Date();

		this.logger.info(
			{ timestamp: now.toISOString() },
			"Starting email verification cleanup job",
		);

		try {
			const deleted = await this.prisma.emailVerification.deleteMany({
				where: {
					expiresAt: { lt: now },
				},
			});

			if (deleted.count === 0) {
				this.logger.debug("No expired verification records found");
			} else {
				this.logger.info(
					{ deletedCount: deleted.count },
					"Expired verification records cleaned",
				);
			}
		} catch (error) {
			this.logger.error(
				{ err: error },
				"Email verification cleanup job failed",
			);
		}
	}
}
