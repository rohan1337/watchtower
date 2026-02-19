import { Module } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";
import { SmtpProvider } from "./email/smtp.provider";

@Module({
	controllers: [NotificationController],
	providers: [NotificationService, SmtpProvider],
	exports: [SmtpProvider],
})
export class NotificationModule {}
