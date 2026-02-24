import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";

function extractJwtFromCookie(req: Request): string | null {
	if (!req) return null;

	const token = req.cookies?.access_token;
	return token ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
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
	}

	async validate(payload: any) {
		return {
			userId: payload.sub,
			tenantId: payload.tenantId,
			role: payload.role,
		};
	}
}
