import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class AlertService {
	constructor(private prisma: PrismaService) {}

	async create(message: string, incidentId: string, user: any) {
		return this.prisma.alert.create({
			data: {
				message,
				incidentId,
				tenantId: user.tenantId,
			},
		});
	}

	async findAll(user: any) {
		const alerts = await this.prisma.alert.findMany({
			where: { tenantId: user.tenantId },
			orderBy: { createdAt: "desc" },
			include: {
				incident: true,
			},
		});

		return alerts.map((alert) => ({
			id: alert.id,
			message: alert.message,
			severity: alert.incident.severity, // derive from incident
			source: alert.source,
			status: alert.status,
			incidentId: alert.incidentId,
			createdAt: alert.createdAt,
		}));
	}

	async findByIncident(incidentId: string, user: any) {
		return this.prisma.alert.findMany({
			where: {
				incidentId,
				tenantId: user.tenantId,
			},
		});
	}
}
