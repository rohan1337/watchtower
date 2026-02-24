import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Severity } from "@prisma/client";

export class CreateIncidentDto {
	@IsString({ message: "Title should be a string" })
	@IsNotEmpty({ message: "Title is required" })
	title: string;

	@IsOptional()
	@IsString({ message: "Description should be a string" })
	description?: string;

	@IsEnum(Severity, { message: "" })
	@IsNotEmpty({ message: "Severity is required" })
	severity: Severity;
}
