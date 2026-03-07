import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { generateFingerprint } from "./utils/fingerprint.util";
import { PinoLogger } from "nestjs-pino";

type AuthUser = {
	sub: string;
	tenantId: string;
	role?: string;
};

@Injectable()
export class AlertService {
	constructor(
		private prisma: PrismaService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(AlertService.name);
	}

	async findAll(user: AuthUser) {
		this.logger.info(
			{ tenantId: user.tenantId, userId: user.sub },
			"Fetching alerts",
		);

		const alerts = await this.prisma.alert.findMany({
			where: { tenantId: user.tenantId },
			orderBy: { createdAt: "desc" },
			include: {
				incident: true,
			},
		});

		this.logger.debug(
			{ tenantId: user.tenantId, count: alerts.length },
			"Alerts fetched",
		);

		return alerts.map((alert) => ({
			id: alert.id,
			message: alert.message,
			severity: alert?.incident?.severity ?? null,
			source: alert.source,
			status: alert.status,
			incidentId: alert.incidentId,
			createdAt: alert.createdAt,
		}));
	}

	async findByIncident(incidentId: string, user: AuthUser) {
		this.logger.info(
			{ tenantId: user.tenantId, incidentId },
			"Fetching alerts for incident",
		);

		const alerts = await this.prisma.alert.findMany({
			where: {
				incidentId,
				tenantId: user.tenantId,
			},
		});

		this.logger.debug(
			{ incidentId, count: alerts.length },
			"Incident alerts fetched",
		);

		return alerts;
	}

	async createFromEvent(event: any) {
		this.logger.info(
			{
				source: event.source,
				service: event.service,
				tenantId: event.tenantId,
			},
			"Creating alert from event",
		);

		const fingerprint = generateFingerprint(
			event.source,
			event.message,
			this.logger,
		);

		const alert = await this.prisma.alert.create({
			data: {
				message: event.message,
				source: event.source,
				service: event.service,
				fingerprint,
				severity: event.severity,
				tenantId: event.tenantId,
			},
		});

		this.logger.debug({ alertId: alert.id, fingerprint }, "Alert created");

		return alert;
	}
}
