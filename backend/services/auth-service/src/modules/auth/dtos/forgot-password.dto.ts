import { IsEmail, IsNotEmpty, Matches } from "class-validator";
import { Transform } from "class-transformer";

export class ForgotPasswordDto {
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() : value,
	)
	@Matches(/^\S+$/, { message: "Email cannot contain spaces" })
	@IsEmail({}, { message: "Email must be a valid email" })
	@IsNotEmpty({ message: "Email is required" })
	email: string;
}
