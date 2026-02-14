import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateTenantDto } from "./dtos/create-tenant.dto";
import { randomUUID } from "crypto";

@Injectable()
export class TenantService {
	constructor(private readonly prisma: PrismaService) {}

	private generateSlug(name: string): string {
		return (
			name
				.toLowerCase()
				.replace(/\s+/g, "-")
				.replace(/[^a-z0-9-]/g, "") +
			"-" +
			randomUUID().slice(0, 6)
		);
	}

	async create(userId: string, dto: CreateTenantDto) {
		const slug = this.generateSlug(dto.name);

		const tenant = await this.prisma.tenant.create({
			data: {
				name: dto.name,
				slug,
				memberships: {
					create: {
						userId,
						role: "OWNER",
					},
				},
			},
		});

		return {
			tenant: {
				id: tenant.id,
				name: tenant.name,
				slug: tenant.slug,
			},
		};
	}
}
