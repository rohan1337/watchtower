import {
	Controller,
	Get,
	Body,
	Req,
	UseGuards,
	Param,
	Patch,
} from "@nestjs/common";
import { IncidentService } from "./incident.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { UpdateIncidentDto } from "./dtos/update-incident.dto";
import { TenantRequired } from "src/common/decorators/tenant-required.decorator";
import { PinoLogger } from "nestjs-pino";

@Controller("inc-ser/api/incidents")
@UseGuards(JwtAuthGuard)
@TenantRequired()
export class IncidentController {
	constructor(
		private readonly service: IncidentService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(IncidentController.name);
	}

	@Get()
	findAll(@Req() req) {
		this.logger.info({ tenantId: req.user.tenantId }, "Fetching incidents");

		return this.service.findAll(req.user);
	}

	@Get("dashboard")
	getDashboard(@Req() req) {
		this.logger.info(
			{ tenantId: req.user.tenantId },
			"Fetching incident dashboard",
		);

		req.user.cookieHeader = req.headers.cookie;
		return this.service.getDashboard(req.user);
	}

	@Get(":id")
	findOne(@Param("id") id: string, @Req() req) {
		this.logger.info(
			{ incidentId: id, tenantId: req.user.tenantId },
			"Fetching incident",
		);

		return this.service.findOne(id, req.user);
	}

	@Patch(":id")
	update(
		@Param("id") id: string,
		@Body() dto: UpdateIncidentDto,
		@Req() req,
	) {
		this.logger.info(
			{ incidentId: id, tenantId: req.user.tenantId },
			"Updating incident",
		);

		return this.service.update(id, dto, req.user);
	}
}
