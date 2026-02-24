import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateIncidentDto } from "./dtos/create-incident.dto";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { UpdateIncidentDto } from "./dtos/update-incident.dto";

@Injectable()
export class IncidentService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly httpService: HttpService,
	) {}

	async create(dto: CreateIncidentDto, user: any) {
		return this.prisma.incident.create({
			data: {
				title: dto.title,
				description: dto.description,
				severity: dto.severity,
				tenantId: user.tenantId,
				createdById: user.sub,
			},
		});
	}

	async findAll(user: any) {
		return this.prisma.incident.findMany({
			where: {
				tenantId: user.tenantId,
			},
			orderBy: { createdAt: "desc" },
		});
	}

	async getDashboard(user: any) {
		const tenantId = user.tenantId;

		// 1️⃣ Recent Incidents
		const recentIncidents = await this.prisma.incident.findMany({
			where: { tenantId },
			orderBy: { createdAt: "desc" },
			take: 5,
		});

		// 2️⃣ Active Incidents
		const activeIncidents = await this.prisma.incident.count({
			where: {
				tenantId,
				status: "OPEN",
			},
		});

		// 3️⃣ Resolved Today
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const resolvedToday = await this.prisma.incident.count({
			where: {
				tenantId,
				status: "RESOLVED",
				updatedAt: {
					gte: today,
				},
			},
		});

		const openAlerts = await this.prisma.alert.count({
			where: {
				tenantId,
				status: "OPEN",
			},
		});

		// 4️⃣ Severity Breakdown
		const severityCounts = await this.prisma.incident.groupBy({
			by: ["severity"],
			where: { tenantId },
			_count: {
				severity: true,
			},
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

		// 5️⃣ Enrich with user data (Auth service call)

		const userIds = [...new Set(recentIncidents.map((i) => i.createdById))];

		let enrichedIncidents = recentIncidents;

		if (userIds.length > 0) {
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

		// 6️⃣ Return full dashboard payload
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
		return this.prisma.incident.findFirst({
			where: {
				id,
				tenantId: user.tenantId, // 🔥 tenant protection
			},
		});
	}

	async update(id: string, dto: UpdateIncidentDto, user: any) {
		return this.prisma.incident.updateMany({
			where: {
				id,
				tenantId: user.tenantId,
			},
			data: dto,
		});
	}
}
