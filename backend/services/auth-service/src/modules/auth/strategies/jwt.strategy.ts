import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../../database/prisma.service";
import { Request } from "express";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private prisma: PrismaService,
		private readonly logger: PinoLogger,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(req: Request) => req?.cookies?.access_token,
			]),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_ACCESS_SECRET,
		});
		this.logger.setContext(JwtStrategy.name);
	}

	async validate(payload: any) {
		const user = await this.prisma.user.findUnique({
			where: { id: payload.sub },
			include: {
				memberships: true,
			},
		});

		if (!user) {
			this.logger.warn(
				{ userId: payload.sub },
				"JWT validation failed: user does not exist",
			);
			throw new UnauthorizedException("User no longer exists");
		}

		if (!user.isActive) {
			this.logger.warn(
				{ userId: user.id },
				"JWT validation failed: inactive user",
			);
			throw new UnauthorizedException();
		}

		if (payload.tenantId) {
			const membership = user.memberships.find(
				(m) => m.tenantId === payload.tenantId,
			);

			if (!membership) {
				this.logger.warn(
					{ userId: user.id, tenantId: payload.tenantId },
					"JWT validation failed: invalid tenant access",
				);
				throw new UnauthorizedException("Invalid tenant access");
			}

			return {
				sub: user.id,
				tenantId: payload.tenantId,
				role: membership.role,
			};
		}

		return {
			sub: user.id,
		};
	}
}
