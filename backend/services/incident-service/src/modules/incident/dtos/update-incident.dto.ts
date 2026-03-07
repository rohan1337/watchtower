import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { IncidentStatus } from "@prisma/client";

export class UpdateIncidentDto {
	@IsOptional()
	@IsString({ message: "Title must be a string" })
	@MaxLength(255, { message: "Title cannot exceed 255 characters" })
	title?: string;

	@IsOptional()
	@IsString({ message: "Description must be a string" })
	@MaxLength(2000, { message: "Description cannot exceed 2000 characters" })
	description?: string;

	@IsOptional()
	@IsEnum(IncidentStatus, {
		message: "Status must be one of: open, investigating, resolved, closed",
	})
	status?: IncidentStatus;
}
