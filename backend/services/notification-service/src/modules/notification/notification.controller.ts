import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { NotificationService } from "./notification.service";
import type { SendEmailEvent } from "./contracts/send-email.event";
import { PinoLogger } from "nestjs-pino";

@Controller()
export class NotificationController {
	constructor(
		private readonly notificationService: NotificationService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(NotificationController.name);
	}

	@EventPattern("send_email")
	async handleSendEmail(@Payload() data: SendEmailEvent) {
		const { email, template } = data;

		this.logger.info({ email, template }, "Received send_email event");

		try {
			await this.notificationService.sendEmail(data);

			this.logger.info(
				{ email, template },
				"Email event processed successfully",
			);
		} catch (error) {
			this.logger.error(
				{ email, template, err: error },
				"Email event processing failed",
			);
			throw error;
		}
	}
}
