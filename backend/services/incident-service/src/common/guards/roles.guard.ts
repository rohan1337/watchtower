import {
	Injectable,
	CanActivate,
	ExecutionContext,
	ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(RolesGuard.name);
	}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.get<string[]>(
			"roles",
			context.getHandler(),
		);

		if (!requiredRoles) return true;

		const request = context.switchToHttp().getRequest();
		const { user } = request;

		if (!requiredRoles.includes(user.role)) {
			this.logger.warn(
				{
					userId: user.userId,
					role: user.role,
					requiredRoles,
					path: request.url,
				},
				"Access denied due to insufficient role",
			);

			throw new ForbiddenException("Insufficient permissions");
		}

		this.logger.debug(
			{
				userId: user.userId,
				role: user.role,
			},
			"Role authorization successful",
		);

		return true;
	}
}
