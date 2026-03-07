import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { PinoLogger } from "nestjs-pino";

function extractJwtFromCookie(req: Request): string | null {
	if (!req) return null;

	const token = req.cookies?.access_token;
	return token ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly logger: PinoLogger) {
		const jwtSecret = process.env.JWT_ACCESS_SECRET;

		if (!jwtSecret) {
			throw new Error(
				"JWT_ACCESS_SECRET is not defined in environment variables",
			);
		}

		super({
			jwtFromRequest: ExtractJwt.fromExtractors([extractJwtFromCookie]),
			ignoreExpiration: false,
			secretOrKey: jwtSecret,
		});

		this.logger.setContext(JwtStrategy.name);

		this.logger.info("JWT strategy initialized");
	}

	async validate(payload: any) {
		this.logger.debug(
			{
				userId: payload.sub,
				tenantId: payload.tenantId,
				role: payload.role,
			},
			"JWT payload validated",
		);

		return {
			userId: payload.sub,
			tenantId: payload.tenantId,
			role: payload.role,
			scope: payload.scope,
		};
	}
}
