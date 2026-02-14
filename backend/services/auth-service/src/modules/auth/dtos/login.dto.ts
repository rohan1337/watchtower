import { IsEmail, IsNotEmpty, IsString, Matches } from "class-validator";
import { Transform } from "class-transformer";

export class LoginDto {
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() : value,
	)
	@IsEmail({}, { message: "Email must be a valid email" })
	@IsNotEmpty({ message: "Email and password is required" })
	email: string;

	@IsString({ message: "Password must be a string" })
	@IsNotEmpty({ message: "Email and password is required" })
	password: string;
}
