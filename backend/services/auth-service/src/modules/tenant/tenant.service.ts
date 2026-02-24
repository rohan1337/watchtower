import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateTenantDto } from "./dtos/create-tenant.dto";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class TenantService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(TenantService.name);
	}

	private async generateUniqueSlug(name: string): Promise<string> {
		const base = name
			.toLowerCase()
			.replace(/\s+/g, "-")
			.replace(/[^a-z0-9-]/g, "");

		let slug = base;
		let counter = 1;

		while (await this.prisma.tenant.findUnique({ where: { slug } })) {
			slug = `${base}-${counter}`;
			counter++;
		}

		return slug;
	}

	async create(userId: string, dto: CreateTenantDto) {
		this.logger.info(
			{ userId, tenantName: dto.name },
			"Tenant creation initiated",
		);

		try {
			const slug = await this.generateUniqueSlug(dto.name);

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

	async findBySlug(slug: string) {
		const tenant = await this.prisma.tenant.findUnique({
			where: { slug },
		});

		if (!tenant) {
			throw new NotFoundException("Tenant not found");
		}

		return {
			id: tenant.id,
			slug: tenant.slug,
		};
	}
}
