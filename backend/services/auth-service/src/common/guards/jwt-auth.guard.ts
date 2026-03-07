import {
	Injectable,
	ExecutionContext,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { TENANT_REQUIRED_KEY } from "../decorators/tenant-required.decorator";
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
					userId: user.sub,
					path: request.url,
				},
				"Tenant scoped session required",
			);

			throw new UnauthorizedException("Tenant-scoped session required");
		}

		this.logger.debug(
			{
				userId: user.sub,
				tenantId: user.tenantId,
			},
			"Authentication successful",
		);

		return user;
	}
}
