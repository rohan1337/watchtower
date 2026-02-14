import { IsNotEmpty, IsUUID } from "class-validator";

export class SelectTenantDto {
	@IsUUID("4", { message: "Invalid Tenant ID" })
	@IsNotEmpty({ message: "Tenant ID is required" })
	tenantId: string;
}
