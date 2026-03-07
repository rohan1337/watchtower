import {
	Injectable,
	ExecutionContext,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { TENANT_REQUIRED_KEY } from "../decorators/tenant-required.decorator";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	constructor(
		private reflector: Reflector,
		private readonly logger: PinoLogger,
	) {
		super();
		this.logger.setContext(JwtAuthGuard.name);
	}

	handleRequest(err, user, info, context: ExecutionContext) {
		const request = context.switchToHttp().getRequest();

		if (err || !user) {
			this.logger.warn(
				{
					path: request.url,
					method: request.method,
				},
				"Authentication failed",
			);

			throw err || new UnauthorizedException();
		}

		const tenantRequired = this.reflector.get<boolean>(
			TENANT_REQUIRED_KEY,
			context.getHandler(),
		);

		if (tenantRequired && user.scope !== "tenant") {
			this.logger.warn(
				{
					userId: user.userId,
					path: request.url,
				},
				"Tenant scoped session required",
			);

			throw new UnauthorizedException("Tenant-scoped session required");
		}

		this.logger.debug(
			{
				userId: user.userId,
				tenantId: user.tenantId,
			},
			"Authentication successful",
		);

		return user;
	}

	canActivate(context: ExecutionContext) {
		const isPublic = this.reflector.getAllAndOverride<boolean>(
			IS_PUBLIC_KEY,
			[context.getHandler(), context.getClass()],
		);

		if (isPublic) {
			this.logger.debug("Public route accessed - skipping auth guard");
			return true;
		}

		return super.canActivate(context);
	}
}
