import * as nodemailer from "nodemailer";

export function createTransporter() {
	console.log(
		"=====Just got inside create transporter function where user and password is initialized from .env",
	);

	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;

	if (!user || !pass) {
		throw new Error("SMTP credentials are missing");
	}

	console.log("=====Host, port, secure, auth, is set now");

	return nodemailer.createTransport({
		host: process.env.SMTP_HOST || "smtp.gmail.com",
		port: 587,
		secure: false,
		auth: {
			user,
			pass,
		},
	});
}

export async function sendMail(options: {
	to: string;
	subject: string;
	html: string;
}) {
	console.log(
		"=====Just got inside send mail function responsible for sending mail",
	);

	const transporter = createTransporter();

	console.log("=====Mail is going to be sent now");

	return transporter.sendMail({
		from: `"Watchtower" <${process.env.SMTP_USER}>`,
		...options,
	});
}
