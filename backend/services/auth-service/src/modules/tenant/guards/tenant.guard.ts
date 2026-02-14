import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";

@Injectable()
export class TenantGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();

		const user = request.user;
		const routeTenantId = request.params.tenantId;

		if (!user?.tenantId) {
			throw new ForbiddenException("No tenant in token");
		}

		if (user.tenantId !== routeTenantId) {
			throw new ForbiddenException(
				"You are not authorized for this tenant",
			);
		}

		return true;
	}
}
