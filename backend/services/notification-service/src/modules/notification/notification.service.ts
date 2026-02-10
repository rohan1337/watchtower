import { Injectable } from "@nestjs/common";
import { sendMail } from "./email/mailer";

@Injectable()
export class NotificationService {
	private async sendVerifyEmail(email: string, token: string) {
		console.log(
			"=====Just got inside send verify email function to get template for sending verification email",
		);

		const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

		await sendMail({
			to: email,
			subject: "Verify your email",
			html: `
				<h2>Verify your email</h2>
				<p>Click the link below to verify your account:</p>
				<a href="${verifyUrl}">${verifyUrl}</a>
			`,
		});

		console.log(`=====Verification email sent to ${email}`);
	}

	private async sendResetPasswordEmail(email: string, token: string) {
		console.log("=====Sending reset password email");

		const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

		await sendMail({
			to: email,
			subject: "Reset your password",
			html: `
				<h2>Reset your password</h2>
				<p>This link will expire in 30 minutes.</p>
				<a href="${resetUrl}">${resetUrl}</a>
			`,
		});

		console.log(`=====Reset password email sent to ${email}`);
	}

	async sendEmail(data: any) {
		console.log("=====Email request received:", data);

		const { email, token, template } = data;

		switch (template) {
			case "VERIFY_EMAIL":
				await this.sendVerifyEmail(email, token);
				break;

			case "RESET_PASSWORD":
				await this.sendResetPasswordEmail(email, token);
				break;

			default:
				console.warn("=====Unknown email template:", template);
		}
	}
}
