import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../../database/prisma.service";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private prisma: PrismaService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(req: Request) => req?.cookies?.access_token,
			]),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_ACCESS_SECRET,
		});
	}

	async validate(payload: any) {
		const user = await this.prisma.user.findUnique({
			where: { id: payload.sub },
			include: {
				memberships: true,
			},
		});

		if (!user) {
			throw new UnauthorizedException("User no longer exists");
		}

		if (!user || !user.isActive) {
			throw new UnauthorizedException();
		}

		// Optional: validate tenant context
		if (payload.tenantId) {
			const membership = user.memberships.find(
				(m) => m.tenantId === payload.tenantId,
			);

			if (!membership) {
				throw new UnauthorizedException("Invalid tenant access");
			}

			return {
				sub: user.id,
				tenantId: payload.tenantId,
				role: membership.role,
			};
		}

		// Identity-level token
		return {
			sub: user.id,
		};
	}
}
