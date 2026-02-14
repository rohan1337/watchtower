import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { Transform } from "class-transformer";

export class CreateTenantDto {
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() : value,
	)
	@IsString({ message: "Workspace name must be a string" })
	@MinLength(2, { message: "Workspace name must be at least 2 characters" })
	@IsNotEmpty({ message: "Workspace name is required" })
	name: string;
}
