import {
	BadRequestException,
	Inject,
	Injectable,
	OnModuleInit,
	UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../database/prisma.service";
import { RegisterDto } from "./dtos/register.dto";
import { VerifyEmailDto } from "./dtos/verify-email.dto";
import { LoginDto } from "./dtos/login.dto";
import { ForgotPasswordDto } from "./dtos/forgot-password.dto";
import { ResetPasswordDto } from "./dtos/reset-password.dto";
import { randomUUID } from "crypto";
import { ClientProxy } from "@nestjs/microservices";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import { PinoLogger } from "nestjs-pino";
import { randomBytes, createHash } from "crypto";
import { Membership } from "@prisma/client";

@Injectable()
export class AuthService implements OnModuleInit {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
		@Inject("EMAIL_SERVICE") private readonly emailClient: ClientProxy,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(AuthService.name);
	}

	async onModuleInit() {
		await this.emailClient.connect();
		this.logger.info("Email service connected");
	}

	// =========================
	// TOKEN GENERATION
	// =========================

	private generateAccessToken(
		userId: string,
		scope?: "global" | "tenant",
		tenantId?: string,
		role?: string,
	) {
		return this.jwtService.sign(
			{
				sub: userId,
				scope,
				tenantId,
				role,
			},
			{
				secret: process.env.JWT_ACCESS_SECRET,
				expiresIn: "15m",
			},
		);
	}

	private generateRefreshToken(userId: string) {
		return this.jwtService.sign(
			{ sub: userId },
			{
				secret: process.env.JWT_REFRESH_SECRET,
				expiresIn: "7d",
			},
		);
	}

	private async issueAuthCookies(
		res: Response,
		userId: string,
		options?: {
			tenantId?: string;
			role?: string;
			rotateRefreshToken?: boolean;
		},
	) {
		const scope = options?.tenantId ? "tenant" : "global";
		const tenantId = options?.tenantId;
		const role = options?.role;
		const rotateRefreshToken = options?.rotateRefreshToken ?? false;

		this.logger.debug(
			{ userId, scope, tenantId, rotateRefreshToken },
			"Issuing auth cookies",
		);

		const accessToken = this.generateAccessToken(
			userId,
			scope,
			tenantId,
			role,
		);

		res.cookie("access_token", accessToken, {
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			maxAge: 15 * 60 * 1000,
		});

		if (rotateRefreshToken) {
			const refreshToken = this.generateRefreshToken(userId);

			const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

			await this.prisma.user.update({
				where: { id: userId },
				data: { refreshTokenHash },
			});

			res.cookie("refresh_token", refreshToken, {
				httpOnly: true,
				sameSite: "lax",
				secure: process.env.NODE_ENV === "production",
				maxAge: 7 * 24 * 60 * 60 * 1000,
			});
		}

		return { accessToken };
	}

	// =========================
	// REGISTER
	// =========================

	async register(dto: RegisterDto, requestId?: string) {
		this.logger.info(
			{ email: dto.email, requestId },
			"Registration initiated",
		);

		const existingUser = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		if (existingUser) {
			this.logger.warn(
				{ email: dto.email, requestId },
				"Registration failed: email already registered",
			);

			throw new BadRequestException("Email already registered");
		}

		const token = randomUUID();

		const hashedPassword = await bcrypt.hash(dto.password, 10);

		this.logger.debug(
			{ email: dto.email },
			"Creating email verification entry",
		);

		await this.prisma.emailVerification.deleteMany({
			where: { email: dto.email },
		});

		await this.prisma.emailVerification.create({
			data: {
				email: dto.email,
				name: dto.name,
				password: hashedPassword,
				token,
				expiresAt: new Date(Date.now() + 30 * 60 * 1000),
			},
		});

		this.emailClient.emit("send_email", {
			email: dto.email,
			token,
			template: "VERIFY_EMAIL",
			requestId,
		});

		this.logger.info(
			{ email: dto.email, requestId },
			"Verification email queued",
		);

		return { success: true, message: "Verification email sent" };
	}

	// =========================
	// VERIFY EMAIL
	// =========================

	async verifyEmail(dto: VerifyEmailDto, res: Response) {
		const { token } = dto;

		const pending = await this.prisma.emailVerification.findUnique({
			where: { token },
		});

		if (!pending || pending.expiresAt < new Date()) {
			this.logger.warn("Invalid or expired email verification token");
			throw new BadRequestException(
				"Invalid or expired verification token",
			);
		}

		const existing = await this.prisma.user.findUnique({
			where: { email: pending.email },
		});

		if (existing) {
			this.logger.warn({ email: pending.email }, "User already verified");
			throw new BadRequestException("User already verified");
		}

		const user = await this.prisma.user.create({
			data: {
				email: pending.email,
				name: pending.name,
				passwordHash: pending.password,
			},
		});

		await this.prisma.emailVerification.delete({
			where: { id: pending.id },
		});

		await this.issueAuthCookies(res, user.id);

		this.logger.info({ userId: user.id }, "Email verified successfully");

		return { success: true };
	}

	// =========================
	// LOGIN
	// =========================

	async login(dto: LoginDto, res: Response) {
		this.logger.info({ email: dto.email }, "Login attempt");

		const user = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		if (!user || !user.passwordHash) {
			this.logger.warn({ email: dto.email }, "Login failed");

			throw new BadRequestException("Invalid credentials");
		}

		const isValid = await bcrypt.compare(dto.password, user.passwordHash);

		if (!isValid) {
			this.logger.warn({ email: dto.email }, "Invalid password attempt");

			throw new BadRequestException("Invalid credentials");
		}

		this.logger.debug({ userId: user.id }, "Credentials validated");

		const memberships = await this.prisma.membership.findMany({
			where: { userId: user.id },
			include: { tenant: true },
		});

		this.logger.debug(
			{ userId: user.id, tenantCount: memberships.length },
			"User memberships fetched",
		);

		const { accessToken } = await this.issueAuthCookies(res, user.id, {
			rotateRefreshToken: true,
		});

		this.logger.debug(
			{ userId: user.id },
			"Access and refresh tokens issued",
		);

		return {
			accessToken,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
			tenants: memberships.map((m) => ({
				id: m.tenantId,
				name: m.tenant.name,
				slug: m.tenant.slug,
				role: m.role,
			})),
		};
	}

	// =========================
	// SELECT WORKSPACE
	// =========================

	async selectWorkspace(userId: string, tenantId: string, res: Response) {
		const membership = await this.prisma.membership.findFirst({
			where: { userId, tenantId },
		});

		if (!membership) {
			this.logger.warn({ userId, tenantId }, "Invalid tenant selection");
			throw new BadRequestException("Invalid tenant selection");
		}

		const { accessToken } = await this.issueAuthCookies(res, userId, {
			tenantId,
			role: membership.role,
			rotateRefreshToken: false,
		});

		this.logger.info({ userId, tenantId }, "Tenant selected");

		return { success: true, accessToken };
	}

	// =========================
	// REFRESH
	// =========================

	async refresh(refreshToken: string, res: Response) {
		this.logger.info("Refresh token request received");

		let payload: any;

		try {
			payload = this.jwtService.verify(refreshToken, {
				secret: process.env.JWT_REFRESH_SECRET,
			});
		} catch {
			this.logger.warn("Invalid refresh token signature");
			throw new UnauthorizedException("Invalid refresh token");
		}

		const user = await this.prisma.user.findUnique({
			where: { id: payload.sub },
		});

		if (!user || !user.refreshTokenHash) {
			this.logger.warn(
				{ userId: payload.sub },
				"Refresh failed: user not found",
			);
			throw new BadRequestException("Invalid refresh token");
		}

		const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);

		if (!valid) {
			this.logger.warn(
				{ userId: user.id },
				"Refresh failed: token mismatch",
			);
			throw new BadRequestException("Invalid refresh token");
		}

		let membership: Membership | null = null;

		if (payload.tenantId) {
			membership = await this.prisma.membership.findFirst({
				where: {
					userId: payload.sub,
					tenantId: payload.tenantId,
				},
			});

			if (!membership) {
				throw new BadRequestException("Invalid tenant context");
			}
		}

		await this.issueAuthCookies(res, user.id, {
			tenantId: membership?.tenantId,
			role: membership?.role,
			rotateRefreshToken: true,
		});

		this.logger.info({ userId: user.id }, "Tokens refreshed");

		return { success: true };
	}

	// =========================
	// FORGOT PASSWORD
	// =========================

	async forgotPassword(dto: ForgotPasswordDto) {
		this.logger.info({ email: dto.email }, "Password reset requested");

		const requestId = randomUUID();

		const user = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		if (!user) return { success: true };

		const rawToken = randomBytes(32).toString("hex");

		const tokenHash = createHash("sha256").update(rawToken).digest("hex");

		await this.prisma.passwordReset.create({
			data: {
				userId: user.id,
				tokenHash,
				expiresAt: new Date(Date.now() + 30 * 60 * 1000),
			},
		});

		this.emailClient.emit("send_email", {
			email: user.email,
			token: rawToken,
			template: "RESET_PASSWORD",
			requestId, // 🔥 propagate request id
		});

		this.logger.info({ userId: user.id }, "Password reset email sent");

		return { success: true };
	}

	// =========================
	// RESET PASSWORD
	// =========================

	async resetPassword(dto: ResetPasswordDto) {
		this.logger.info("Password reset attempt");

		const tokenHash = createHash("sha256").update(dto.token).digest("hex");

		const resetEntry = await this.prisma.passwordReset.findUnique({
			where: { tokenHash },
		});

		if (!resetEntry) {
			this.logger.warn("Invalid or expired reset token");
			throw new BadRequestException("Invalid or expired reset token");
		}

		const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

		await this.prisma.user.update({
			where: { id: resetEntry.userId },
			data: { passwordHash: newPasswordHash },
		});

		await this.prisma.passwordReset.delete({
			where: { id: resetEntry.id },
		});

		this.logger.info(
			{ userId: resetEntry.userId },
			"Password reset successful",
		);

		return { success: true };
	}

	// =========================
	// LOGOUT
	// =========================

	async logout(userId: string, res: Response) {
		await this.prisma.user.update({
			where: { id: userId },
			data: { refreshTokenHash: null },
		});

		res.clearCookie("access_token");
		res.clearCookie("refresh_token");

		this.logger.info({ userId }, "User logged out");

		return { success: true };
	}

	// =========================
	// ME
	// =========================

	async me(payload: { sub: string; tenantId?: string; role?: string }) {
		const user = await this.prisma.user.findUnique({
			where: { id: payload.sub },
			include: {
				memberships: {
					include: { tenant: true },
				},
			},
		});

		if (!user) {
			throw new UnauthorizedException("You are not authorized");
		}

		return {
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				selectedTenantId: payload.tenantId || null,
				role: payload.role || null,
				tenants: user.memberships.map((m) => ({
					id: m.tenantId,
					name: m.tenant.name,
					slug: m.tenant.slug,
					role: m.role,
				})),
			},
		};
	}

	async findByIds(ids: string[]) {
		this.logger.info(
			{ idCount: ids.length, scope: "bulk-lookup" },
			"Bulk user fetch initiated",
		);

		const users = await this.prisma.user.findMany({
			where: {
				id: { in: ids },
			},
			select: {
				id: true,
				name: true,
			},
		});

		this.logger.info(
			{ returnedCount: users.length },
			"Bulk user fetch completed",
		);

		return users;
	}
}
