import {
	IsNotEmpty,
	IsString,
	IsUUID,
	Matches,
	MinLength,
} from "class-validator";
import { Transform } from "class-transformer";

export class ResetPasswordDto {
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() : value,
	)
	@IsUUID("4", { message: "Invalid reset token" })
	@IsNotEmpty({ message: "Reset token is required" })
	token: string;

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
	@IsNotEmpty({ message: "Password is required" })
	newPassword: string;
}
