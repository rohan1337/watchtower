import {
	Controller,
	Post,
	Headers,
	Body,
	Patch,
	UseGuards,
	Param,
	Req,
	Get,
} from "@nestjs/common";
import { IntegrationService } from "./integration.service";
import { Public } from "src/common/decorators/public.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { TenantRequired } from "src/common/decorators/tenant-required.decorator";

@Controller("api/integrations")
export class IntegrationController {
	constructor(private readonly integrationService: IntegrationService) {}

	@Post("webhook")
	@Public()
	async ingestWebhook(
		@Headers("x-api-key") apiKey: string,
		@Body() payload: any,
	) {
		await this.integrationService.handleWebhook(apiKey, payload);

		return { message: "Event received" };
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	@TenantRequired()
	async list(@Req() req: any) {
		return this.integrationService.listByTenant(req.user.tenantId);
	}

	/* ----------------------------------------
     🔄 ROTATE API KEY (Protected)
	-----------------------------------------*/
	@Patch(":id/rotate-key")
	@UseGuards(JwtAuthGuard)
	@TenantRequired()
	async rotateKey(@Param("id") id: string, @Req() req: any) {
		return this.integrationService.rotateApiKey(id, req.user.tenantId);
	}

	/* ----------------------------------------
     🔘 TOGGLE INTEGRATION (Protected)
	-----------------------------------------*/
	@Patch(":id/toggle")
	@UseGuards(JwtAuthGuard)
	@TenantRequired()
	async toggleIntegration(
		@Param("id") id: string,
		@Body() body: { isActive: boolean },
		@Req() req: any,
	) {
		return this.integrationService.toggleIntegration(
			id,
			req.user.tenantId,
			body.isActive,
		);
	}
}
