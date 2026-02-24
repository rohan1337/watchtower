import { IsEnum, IsOptional, IsString } from "class-validator";
import { IncidentStatus } from "@prisma/client";

export class UpdateIncidentDto {
	@IsOptional()
	@IsString()
	title?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsEnum(IncidentStatus)
	status?: IncidentStatus;
}
