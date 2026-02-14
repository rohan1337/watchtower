import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { TenantService } from "./tenant.service";
import { CreateTenantDto } from "./dtos/create-tenant.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "./guards/tenant.guard";

@Controller("auth-ser/api/tenants")
export class TenantController {
	constructor(private readonly tenantService: TenantService) {}

	@UseGuards(JwtAuthGuard, TenantGuard)
	@Post()
	create(@Req() req, @Body() dto: CreateTenantDto) {
		return this.tenantService.create(req.user.sub, dto);
	}
}
