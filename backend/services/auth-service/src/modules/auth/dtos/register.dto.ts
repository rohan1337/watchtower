import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
	MinLength,
} from "class-validator";
import { Transform } from "class-transformer";

export class RegisterDto {
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() : value,
	)
	@Matches(/^(?!.* {2,})([A-Za-z]+(?: [A-Za-z]+)*)$/, {
		message: "Name cannot contain multiple consecutive spaces",
	})
	@IsString({ message: "Name must be a string" })
	name?: string;

	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() : value,
	)
	@Matches(/^\S+$/, { message: "Email cannot contain spaces" })
	@IsEmail({}, { message: "Email must be a valid email" })
	@IsNotEmpty({ message: "Email and password is required" })
	email: string;

	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() : value,
	)
	@Matches(/^\S+$/, { message: "Password cannot contain spaces" })
	@IsString({ message: "Password must be a string" })
	@MinLength(8, { message: "Password must be at least 8 characters long" })
	@Matches(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
		{
			message:
				"Password must include uppercase, lowercase, number, and symbol",
		},
	)
	@IsNotEmpty({ message: "Email and password is required" })
	password: string;
}
