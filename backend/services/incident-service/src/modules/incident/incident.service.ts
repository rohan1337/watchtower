import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateIncidentDto } from "./dtos/create-incident.dto";

@Injectable()
export class IncidentService {
	constructor(private prisma: PrismaService) {}

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
}
