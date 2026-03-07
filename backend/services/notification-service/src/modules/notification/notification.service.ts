import { Injectable } from "@nestjs/common";
import { SendEmailEvent } from "./contracts/send-email.event";
import { PinoLogger } from "nestjs-pino";
import { SmtpProvider } from "./email/smtp.provider";

@Injectable()
export class NotificationService {
	constructor(
		private readonly logger: PinoLogger,
		private readonly smtpProvider: SmtpProvider,
	) {
		this.logger.setContext(NotificationService.name);
	}

	private async sendVerifyEmail(
		email: string,
		token: string,
		requestId?: string,
	) {
		this.logger.info({ email, requestId }, "Sending verification email");

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

			this.logger.info(
				{ email, requestId },
				"Verification email sent successfully",
			);
		} catch (error) {
			this.logger.error(
				{ email, requestId, err: error },
				"Failed to send verification email",
			);

			throw error;
		}
	}

	private async sendResetPasswordEmail(
		email: string,
		token: string,
		requestId?: string,
	) {
		this.logger.info({ email, requestId }, "Sending reset password email");

		const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

		try {
			await this.smtpProvider.send({
				to: email,
				subject: "Reset your password",
				html: `
          <h2>Reset your password</h2>
          <p>This link will expire in 30 minutes.</p>
          <a href="${resetUrl}">${resetUrl}</a>
        `,
			});

			this.logger.info(
				{ email, requestId },
				"Reset password email sent successfully",
			);
		} catch (error) {
			this.logger.error(
				{ email, requestId, err: error },
				"Failed to send reset password email",
			);

			throw error;
		}
	}

	async sendEmail(data: SendEmailEvent) {
		const { email, template, requestId } = data;

		this.logger.info(
			{ email, template, requestId },
			"Email request received",
		);

		switch (template) {
			case "VERIFY_EMAIL":
				await this.sendVerifyEmail(email, data.token, requestId);
				break;

			case "RESET_PASSWORD":
				await this.sendResetPasswordEmail(email, data.token, requestId);
				break;

			default:
				this.logger.warn(
					{ template, requestId },
					"Unknown email template received",
				);

				throw new Error("Unknown email template");
		}
	}
}
