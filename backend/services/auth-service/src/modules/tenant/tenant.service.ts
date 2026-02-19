import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateTenantDto } from "./dtos/create-tenant.dto";
import { randomUUID } from "crypto";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class TenantService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(TenantService.name);
	}

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
		this.logger.info(
			{ userId, tenantName: dto.name },
			"Tenant creation initiated",
		);

		try {
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

			this.logger.info(
				{ userId, tenantId: tenant.id },
				"Tenant created successfully",
			);

			return {
				tenant: {
					id: tenant.id,
					name: tenant.name,
					slug: tenant.slug,
				},
			};
		} catch (error) {
			this.logger.error({ userId, err: error }, "Tenant creation failed");
			throw error;
		}
	}
}
