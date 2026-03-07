import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../../database/prisma.service";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class AutoResolveService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(AutoResolveService.name);
	}

	// Runs every minute
	@Cron("*/1 * * * *")
	async checkInactiveIncidents() {
		const thresholdMinutes = 5;

		const cutoff = new Date(Date.now() - thresholdMinutes * 60 * 1000);

		this.logger.debug(
			{ cutoff },
			"Checking for inactive incidents to auto-resolve",
		);

		try {
			const result = await this.prisma.incident.updateMany({
				where: {
					status: "OPEN",
					lastAlertAt: { lt: cutoff },
				},
				data: {
					status: "RESOLVED",
					resolvedAt: new Date(),
				},
			});

			if (result.count > 0) {
				this.logger.info(
					{ resolvedCount: result.count },
					"Auto-resolved inactive incidents",
				);
			} else {
				this.logger.debug(
					"No inactive incidents found for auto-resolution",
				);
			}
		} catch (error) {
			this.logger.error(
				{ err: error },
				"Failed to auto-resolve inactive incidents",
			);
			throw error;
		}
	}
}
