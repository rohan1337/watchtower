import {
	Controller,
	Get,
	Post,
	Body,
	Req,
	UseGuards,
	Param,
	Patch,
} from "@nestjs/common";
import { IncidentService } from "./incident.service";
import { CreateIncidentDto } from "./dtos/create-incident.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { UpdateIncidentDto } from "./dtos/update-incident.dto";

@Controller("inc-ser/api/incidents")
@UseGuards(JwtAuthGuard)
export class IncidentController {
	constructor(private readonly service: IncidentService) {}

	@Post()
	create(@Body() dto: CreateIncidentDto, @Req() req) {
		return this.service.create(dto, req.user);
	}

	@Get()
	findAll(@Req() req) {
		return this.service.findAll(req.user);
	}

	@Get("dashboard")
	getDashboard(@Req() req) {
		req.user.cookieHeader = req.headers.cookie;
		return this.service.getDashboard(req.user);
	}

	@Get(":id")
	findOne(@Param("id") id: string, @Req() req) {
		return this.service.findOne(id, req.user);
	}

	@Patch(":id")
	update(
		@Param("id") id: string,
		@Body() dto: UpdateIncidentDto,
		@Req() req,
	) {
		return this.service.update(id, dto, req.user);
	}
}
