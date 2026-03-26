import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AlertService } from "./alert.service";
import { TenantRequired } from "src/common/decorators/tenant-required.decorator";
import { PinoLogger } from "nestjs-pino";

type AuthUser = {
	sub: string;
	tenantId: string;
	role?: string;
};

@Controller("api/alerts")
@UseGuards(JwtAuthGuard)
@TenantRequired()
export class AlertController {
	constructor(
		private readonly service: AlertService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(AlertController.name);
	}

	@Get()
	async findAll(@Req() req: { user: AuthUser }) {
		this.logger.info({ userId: req.user.sub }, "Fetching alerts");

		const alerts = await this.service.findAll(req.user);

		this.logger.debug(
			{ count: alerts.length, userId: req.user.sub },
			"Alerts fetched successfully",
		);

		return alerts;
	}
}
