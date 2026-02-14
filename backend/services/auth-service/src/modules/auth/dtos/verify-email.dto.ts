import { IsNotEmpty, IsUUID } from "class-validator";

export class VerifyEmailDto {
	@IsUUID("4", { message: "Invalid verification token" })
	@IsNotEmpty({ message: "Reset token is required" })
	token: string;
}
