import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { TenantService } from "./tenant.service";
import { CreateTenantDto } from "./dtos/create-tenant.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PinoLogger } from "nestjs-pino";

@Controller("auth-ser/api/tenants")
export class TenantController {
	constructor(
		private readonly tenantService: TenantService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(TenantController.name);
	}

	@UseGuards(JwtAuthGuard)
	@Post()
	create(@Req() req, @Body() dto: CreateTenantDto) {
		this.logger.info(
			{
				userId: req.user.sub,
				tenantName: dto.name,
			},
			"Create tenant request received",
		);

		return this.tenantService.create(req.user.sub, dto);
	}
}
