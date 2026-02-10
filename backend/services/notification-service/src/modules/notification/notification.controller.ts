import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { NotificationService } from "./notification.service";

@Controller()
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@EventPattern("send_email")
	async handleSendEmail(@Payload() data: any) {
		console.log(
			"=====Just got inside handle send email function in notification controller",
		);
		console.log("=====Event received:", data);
		await this.notificationService.sendEmail(data);
	}
}
