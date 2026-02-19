export type EmailTemplate = "VERIFY_EMAIL" | "RESET_PASSWORD";

export interface SendEmailEvent {
	email: string;
	token: string;
	template: EmailTemplate;
}
