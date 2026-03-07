import { IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { EventType, Severity } from "@prisma/client";

export class CreateEventDto {
	@IsString({ message: "Source must be a string" })
	@IsNotEmpty({ message: "Source is required" })
	source: string;

	@IsString({ message: "Message must be a string" })
	@IsNotEmpty({ message: "Message is required" })
	@MaxLength(2000, { message: "Message cannot exceed 2000 characters" })
	message: string;

	@IsString({ message: "Service must be a string" })
	@IsNotEmpty({ message: "Service is required" })
	service: string;

	@IsEnum(Severity, {
		message: "Severity must be one of: low, medium, high, critical",
	})
	severity: Severity;

	@IsEnum(EventType, {
		message: "Type must be one of: log, metric, trace, error",
	})
	type: EventType;
}
