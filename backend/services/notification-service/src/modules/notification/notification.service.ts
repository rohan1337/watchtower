import { Injectable } from "@nestjs/common";
import { SendEmailEvent } from "./contracts/send-email.event";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { SmtpProvider } from "./email/smtp.provider";

@Injectable()
export class NotificationService {
	constructor(
		@InjectPinoLogger(NotificationService.name)
		private readonly logger: PinoLogger,
		private readonly smtpProvider: SmtpProvider,
	) {}

	private async sendVerifyEmail(email: string, token: string) {
		this.logger.info({ email }, "Sending verification email");

		const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

		try {
			await this.smtpProvider.send({
				to: email,
				subject: "Verify your email",
				html: `
          <h2>Verify your email</h2>
          <p>Click the link below to verify your account:</p>
          <a href="${verifyUrl}">${verifyUrl}</a>
        `,
			});

			this.logger.info({ email }, "Verification email sent successfully");
		} catch (error) {
			this.logger.error(
				{ email, err: error },
				"Failed to send verification email",
			);
			throw error;
		}
	}

	private async sendResetPasswordEmail(email: string, token: string) {
		this.logger.info({ email }, "Sending reset password email");

		const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

		try {
			await this.smtpProvider.send({
				to: email,
				subject: "...",
				html: `
          <h2>Reset your password</h2>
          <p>This link will expire in 30 minutes.</p>
          <a href="${resetUrl}">${resetUrl}</a>
        `,
			});

			this.logger.info(
				{ email },
				"Reset password email sent successfully",
			);
		} catch (error) {
			this.logger.error(
				{ email, err: error },
				"Failed to send reset password email",
			);
			throw error;
		}
	}

	async sendEmail(data: SendEmailEvent) {
		const { email, template } = data;

		this.logger.info({ email, template }, "Email request received");

		switch (template) {
			case "VERIFY_EMAIL":
				await this.sendVerifyEmail(email, data.token);
				break;

			case "RESET_PASSWORD":
				await this.sendResetPasswordEmail(email, data.token);
				break;

			default:
				this.logger.warn(
					{ template },
					"Unknown email template received",
				);
				throw new Error("Unknown email template");
		}
	}
}
