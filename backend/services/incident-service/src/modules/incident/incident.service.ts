import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { UpdateIncidentDto } from "./dtos/update-incident.dto";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class IncidentService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly httpService: HttpService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(IncidentService.name);
	}

	private getSeverityWeight(severity: string) {
		switch (severity) {
			case "LOW":
				return 1;
			case "MEDIUM":
				return 3;
			case "HIGH":
				return 5;
			case "CRITICAL":
				return 8;
			default:
				return 0;
		}
	}

	async findAll(user: any) {
		this.logger.debug(
			{ tenantId: user.tenantId },
			"Fetching incidents from database",
		);

		return this.prisma.incident.findMany({
			where: { tenantId: user.tenantId },
			orderBy: { createdAt: "desc" },
		});
	}

	async getDashboard(user: any) {
		const tenantId = user.tenantId;

		this.logger.info({ tenantId }, "Building incident dashboard");

		const recentIncidents = await this.prisma.incident.findMany({
			where: { tenantId },
			orderBy: { createdAt: "desc" },
			take: 5,
		});

		const activeIncidents = await this.prisma.incident.count({
			where: {
				tenantId,
				status: "OPEN",
			},
		});

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const resolvedToday = await this.prisma.incident.count({
			where: {
				tenantId,
				status: "RESOLVED",
				updatedAt: { gte: today },
			},
		});

		const openAlerts = await this.prisma.alert.count({
			where: {
				tenantId,
				status: "OPEN",
			},
		});

		const severityCounts = await this.prisma.incident.groupBy({
			by: ["severity"],
			where: { tenantId },
			_count: { severity: true },
		});

		const severityBreakdown = {
			CRITICAL: 0,
			HIGH: 0,
			MEDIUM: 0,
			LOW: 0,
		};

		severityCounts.forEach((item) => {
			severityBreakdown[item.severity] = item._count.severity;
		});

		const userIds = [...new Set(recentIncidents.map((i) => i.createdById))];

		let enrichedIncidents = recentIncidents;

		if (userIds.length > 0) {
			this.logger.debug(
				{ userCount: userIds.length },
				"Fetching user data from auth service",
			);

			const response = await firstValueFrom(
				this.httpService.post(
					`${process.env.AUTH_URL}/auth/bulk`,
					{ ids: userIds },
					{
						headers: {
							Cookie: user.cookieHeader,
						},
					},
				),
			);

			const users = response.data;
			const userMap = Object.fromEntries(
				users.map((u: any) => [u.id, u]),
			);

			enrichedIncidents = recentIncidents.map((i) => ({
				...i,
				createdBy: userMap[i.createdById] || null,
			}));
		}

		return {
			stats: {
				activeIncidents,
				resolvedToday,
			},
			alertCount: openAlerts,
			severityBreakdown,
			recentIncidents: enrichedIncidents,
		};
	}

	async findOne(id: string, user: any) {
		this.logger.debug(
			{ incidentId: id, tenantId: user.tenantId },
			"Fetching single incident",
		);

		return this.prisma.incident.findFirst({
			where: {
				id,
				tenantId: user.tenantId,
			},
		});
	}

	async update(id: string, dto: UpdateIncidentDto, user: any) {
		this.logger.info(
			{ incidentId: id, tenantId: user.tenantId },
			"Updating incident",
		);

		return this.prisma.incident.updateMany({
			where: {
				id,
				tenantId: user.tenantId,
			},
			data: dto,
		});
	}

	async createOrAttach(alert: any, event: any) {
		this.logger.debug(
			{ fingerprint: alert.fingerprint, tenantId: alert.tenantId },
			"Finding or creating incident",
		);

		return this.prisma.$transaction(async (tx) => {
			let incident = await tx.incident.findFirst({
				where: {
					tenantId: alert.tenantId,
					fingerprint: alert.fingerprint,
					status: "OPEN",
				},
			});

			if (!incident) {
				this.logger.info(
					{ fingerprint: alert.fingerprint },
					"Creating new incident",
				);

				try {
					incident = await tx.incident.create({
						data: {
							title: alert.message,
							description: "Auto-generated incident",
							service: event.service,
							severity: alert.severity,
							tenantId: alert.tenantId,
							createdById: "system",
							fingerprint: alert.fingerprint,
							alertCount: 0,
							severityScore: 0,
							lastAlertAt: new Date(),
						},
					});
				} catch (error: any) {
					if (error.code === "P2002") {
						this.logger.warn(
							{ fingerprint: alert.fingerprint },
							"Incident already created concurrently",
						);

						incident = await tx.incident.findFirst({
							where: {
								tenantId: alert.tenantId,
								fingerprint: alert.fingerprint,
								status: "OPEN",
							},
						});
					} else {
						throw error;
					}
				}
			}

			await tx.alert.update({
				where: { id: alert.id },
				data: { incidentId: incident!.id },
			});

			const weight = this.getSeverityWeight(alert.severity);

			this.logger.debug(
				{ incidentId: incident!.id, weight },
				"Updating incident metrics",
			);

			return tx.incident.update({
				where: { id: incident!.id },
				data: {
					alertCount: { increment: 1 },
					severityScore: { increment: weight },
					lastAlertAt: new Date(),
				},
			});
		});
	}
}
