import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { AlertService } from "./alert.service";

@Controller("inc-ser/api/alerts")
@UseGuards(JwtAuthGuard)
export class AlertController {
	constructor(private readonly service: AlertService) {}

	@Get()
	findAll(@Req() req) {
		return this.service.findAll(req.user);
	}
}
