import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { EventService } from "./event.service";
import { CreateEventDto } from "./dtos/create-event.dto";
import { TenantRequired } from "src/common/decorators/tenant-required.decorator";
import { PinoLogger } from "nestjs-pino";

@Controller("inc-ser/api/events")
@UseGuards(JwtAuthGuard)
@TenantRequired()
export class EventController {
	constructor(
		private readonly service: EventService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(EventController.name);
	}

	@Post()
	async create(@Body() dto: CreateEventDto, @Req() req) {
		this.logger.info(
			{
				userId: req.user.sub,
				tenantId: req.user.tenantId,
				source: dto.source,
				service: dto.service,
			},
			"Create event request received",
		);

		return this.service.create(dto, req.user);
	}
}
