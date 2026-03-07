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

		this.logger.debug({ baseSlug: base }, "Generating unique tenant slug");

		while (await this.prisma.tenant.findUnique({ where: { slug } })) {
			this.logger.debug({ slug }, "Slug already exists, generating new");

			slug = `${base}-${counter}`;
			counter++;
		}

		this.logger.debug({ finalSlug: slug }, "Unique slug generated");

		return slug;
	}

	async create(userId: string, dto: CreateTenantDto, requestId?: string) {
		this.logger.info(
			{ userId, tenantName: dto.name, requestId },
			"Tenant creation initiated",
		);

		try {
			const slug = await this.generateUniqueSlug(dto.name);

			this.logger.debug(
				{ userId, slug },
				"Creating tenant record in database",
			);

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
				{
					requestId,
					userId,
					tenantId: tenant.id,
					slug: tenant.slug,
				},
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
			this.logger.error(
				{
					requestId,
					userId,
					err: error,
				},
				"Tenant creation failed",
			);

			throw error;
		}
	}

	async findBySlug(slug: string) {
		this.logger.debug({ slug }, "Searching tenant by slug");

		const tenant = await this.prisma.tenant.findUnique({
			where: { slug },
		});

		if (!tenant) {
			this.logger.warn({ slug }, "Tenant not found");

			throw new NotFoundException("Tenant not found");
		}

		this.logger.debug(
			{ tenantId: tenant.id, slug },
			"Tenant found successfully",
		);

		return {
			id: tenant.id,
			slug: tenant.slug,
		};
	}
}
