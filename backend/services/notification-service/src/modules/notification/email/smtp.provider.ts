import { Injectable, OnModuleInit } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";
import * as nodemailer from "nodemailer";

@Injectable()
export class SmtpProvider implements OnModuleInit {
	private transporter: nodemailer.Transporter;

	constructor(private readonly logger: PinoLogger) {}

	async onModuleInit() {
		this.transporter = this.createTransporter();
		await this.transporter.verify();
		this.logger.info("SMTP connection verified");
	}

	private createTransporter(): nodemailer.Transporter {
		const user = process.env.SMTP_USER;
		const pass = process.env.SMTP_PASS;

		if (!user || !pass) {
			throw new Error("SMTP credentials are missing");
		}

		return nodemailer.createTransport({
			host: process.env.SMTP_HOST || "smtp.gmail.com",
			port: 587,
			secure: false,
			pool: true,
			maxConnections: 5,
			maxMessages: 100,
			auth: { user, pass },
		});
	}

	async send(options: { to: string; subject: string; html: string }) {
		const maxRetries = 3;
		let attempt = 0;

		while (attempt < maxRetries) {
			try {
				return await this.transporter.sendMail({
					from: `"Watchtower" <${process.env.SMTP_USER}>`,
					...options,
				});
			} catch (error) {
				attempt++;
				if (attempt >= maxRetries) throw error;

				const delay = 500 * Math.pow(2, attempt);
				await new Promise((res) => setTimeout(res, delay));
			}
		}
	}
}
