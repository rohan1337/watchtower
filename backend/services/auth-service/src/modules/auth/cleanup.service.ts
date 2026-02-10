import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class CleanupService {
	constructor(private readonly prisma: PrismaService) {}

	// Runs every 2 hours — adjust as per your needs
	@Cron("0 */2 * * *")
	async cleanupExpired() {
		console.log(
			"=====Running cleanup cronjob for cleaning temporary user data during registration",
		);

		const deleted = await this.prisma.emailVerification.deleteMany({
			where: {
				expiresAt: { lt: new Date() },
			},
		});

		console.log(
			`=====Cleanup complete: ${deleted.count} expired rows deleted`,
		);
	}
}
