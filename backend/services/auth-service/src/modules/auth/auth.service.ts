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
import { SelectTenantDto } from "./dtos/select-tenant.dto";

@Injectable()
export class AuthService implements OnModuleInit {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
		@Inject("EMAIL_SERVICE") private readonly emailClient: ClientProxy,
	) {}

	private generateAccessToken(
		userId: string,
		tenantId: string,
		role: string,
	) {
		console.log("=====Just got inside generate access token function");

		console.log(
			"=====Generating access token with the help of jwt service where user id, tenant id, rolw, jwt access secret, and expiry date of 15m is stored in access token",
		);

		return this.jwtService.sign(
			{
				sub: userId,
				tenantId,
				role,
			},
			{
				secret: process.env.JWT_ACCESS_SECRET,
				expiresIn: "15m",
			},
		);
	}

	private generateRefreshToken(
		userId: string,
		tenantId: string,
		role: string,
	) {
		console.log("=====Just got inside generate refresh token function");

		console.log(
			"=====Generating refresh token with the help of jwt service where user id, tenant id, role, jwt refresh secret, and expiry date of 7d is stored in refresh token",
		);

		return this.jwtService.sign(
			{
				sub: userId,
				tenantId,
				role,
			},
			{
				secret: process.env.JWT_REFRESH_SECRET,
				expiresIn: "7d",
			},
		);
	}

	async onModuleInit() {
		await this.emailClient.connect();
		console.log("=====Email client connected to Redis");
	}

	private async issueAuthCookies(
		res: Response,
		userId: string,
		tenantId?: string,
		role?: string,
	) {
		console.log("=====Just got inside issue auth cookies model");

		console.log(
			"=====Initializing payload with sub which is user id, tenant id and role id",
		);

		const payload: any = { sub: userId };

		if (tenantId && role) {
			payload.tenantId = tenantId;
			payload.role = role;
		}

		console.log("=====Payload initialized");

		console.log(
			"=====Generating access and refresh token with payload and different expiration times",
		);

		let accessToken: string;
		let refreshToken: string;

		if (tenantId && role) {
			accessToken = this.generateAccessToken(userId, tenantId, role);
			refreshToken = this.generateRefreshToken(userId, tenantId, role);
		} else {
			// Identity-level token (no tenant context)
			accessToken = this.jwtService.sign(
				{ sub: userId },
				{
					secret: process.env.JWT_ACCESS_SECRET,
					expiresIn: "15m",
				},
			);

			refreshToken = this.jwtService.sign(
				{ sub: userId },
				{
					secret: process.env.JWT_REFRESH_SECRET,
					expiresIn: "7d",
				},
			);
		}

		console.log("=====Generated access and refresh token");

		console.log("=====Hashing refresh token");

		const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

		console.log("=====Refresh token hashed");

		console.log("=====Updating refresh token hash in user table");

		await this.prisma.user.update({
			where: { id: userId },
			data: { refreshTokenHash },
		});

		console.log("=====User table updated");

		console.log(
			"=====Generating access and refresh token cookies with http only true, same site lax, not secure, and variable max age",
		);

		res.cookie("access_token", accessToken, {
			httpOnly: true,
			sameSite: "lax",
			secure: false,
			maxAge: 15 * 60 * 1000,
		});

		res.cookie("refresh_token", refreshToken, {
			httpOnly: true,
			sameSite: "lax",
			secure: false,
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		console.log("=====Generated access and refresh token cookies");
	}

	async register(dto: RegisterDto) {
		console.log(
			"=====Just got inside register method of register service with email:",
			dto.email,
		);

		console.log(
			"=====Checking if the user exists or not with the help of email",
		);

		const existingUser = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		if (existingUser) {
			throw new BadRequestException("Email already registered");
		}

		console.log("=====User is not registered");

		console.log(
			"=====Generating token that consists random uuid and hashed password",
		);

		const token = randomUUID();
		const hashedPassword = await bcrypt.hash(dto.password, 10);

		console.log(
			"=====Generated random uuid and hashed password which is to be stored for temporary basis",
		);

		console.log(
			"=====Before registering user, sending verification email to user's email, saving user temporarily to email verification table and setting expiration time to 30m",
		);

		await this.prisma.emailVerification.deleteMany({
			where: { email: dto.email },
		});

		// Create new verification entry
		await this.prisma.emailVerification.create({
			data: {
				email: dto.email,
				name: dto.name,
				password: hashedPassword,
				token,
				expiresAt: new Date(Date.now() + 30 * 60 * 1000),
			},
		});

		// Send email later through notification service
		console.log(
			"=====Verification link:",
			`http://localhost:3000/verify?token=${token}`,
		);

		console.log(
			"=====Emitting send_email signal and template type to be VERIFY_EMAIL to notification service",
		);

		this.emailClient.emit("send_email", {
			email: dto.email,
			token,
			template: "VERIFY_EMAIL",
		});

		console.log("=====Verification email sent to the user");

		return { success: true, message: "Verification email sent" };
	}

	async verifyEmail(dto: VerifyEmailDto, res: Response) {
		console.log(
			"=====Just got inside verify email method of verify email service",
		);

		console.log(
			"=====Checking if the user exists in the email verification table with the help of token",
		);

		const { token } = dto;

		const pending = await this.prisma.emailVerification.findUnique({
			where: { token },
		});

		console.log(
			"=====Temporary user found who is stored in email verification table",
		);

		console.log(
			"=====Checking if the verification token is expired or not",
		);

		if (!pending || pending.expiresAt < new Date()) {
			throw new BadRequestException(
				"Invalid or expired verification token",
			);
		}

		console.log("=====Verification token is not expired");

		console.log(
			"=====Checking if the user exists as two verification processes may happen simultaneously and can create two duplicate users",
		);

		const existing = await this.prisma.user.findUnique({
			where: { email: pending.email },
		});

		if (existing) {
			throw new BadRequestException("User already verified");
		}

		console.log("=====User doesn't exists");

		console.log("=====Registering user now in user table");

		const user = await this.prisma.user.create({
			data: {
				email: pending.email,
				name: pending.name,
				passwordHash: pending.password,
			},
		});

		console.log("=====User is registered in user table");

		console.log(
			"=====Deleting the user data from email verification table",
		);

		// Delete the temp entry
		await this.prisma.emailVerification.delete({
			where: { id: pending.id },
		});

		console.log("=====Temporary user data deleted");

		console.log("=====Generating access token");

		await this.issueAuthCookies(res, user.id);

		console.log("=====Access token generated");

		return { success: true };
	}

	async login(dto: LoginDto, res: Response) {
		console.log(
			"=====Just got inside login method of login service with email:",
			dto.email,
		);

		console.log("=====Finding the user with the help of email");

		const user = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		if (!user || !user.passwordHash) {
			throw new BadRequestException("Invalid credentials");
		}

		console.log("=====User found");

		console.log("=====Checking if the password provided is valid or not");

		const isValid = await bcrypt.compare(dto.password, user.passwordHash);
		if (!isValid) {
			throw new BadRequestException("Invalid credentials");
		}

		console.log("=====Password is valid");

		console.log("=====Checking if the user has tenant memberships or not");

		const memberships = await this.prisma.membership.findMany({
			where: { userId: user.id },
			include: {
				tenant: true,
			},
		});

		return {
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
			tenants: memberships.map((m) => ({
				tenantId: m.tenantId,
				name: m.tenant.name,
				role: m.role,
			})),
		};
	}

	async selectTenant(userId: string, tenantId: string, res: Response) {
		console.log(
			"=====Just got inside select tenant method of selecte tenant service",
		);

		console.log(
			"=====Checking if any membership exists based on user id and tenant id",
		);

		const membership = await this.prisma.membership.findFirst({
			where: {
				userId,
				tenantId,
			},
		});

		if (!membership) {
			throw new BadRequestException("Invalid tenant selection");
		}

		console.log("=====Membership exists");

		console.log("=====Generating access and refresh tokens");

		await this.issueAuthCookies(res, userId, tenantId, membership.role);

		console.log("=====Generated access and refresh tokens");

		console.log("=====Returning access and refresh tokens to the frontend");

		return { success: true };
	}

	async refresh(refreshToken: string, res: Response) {
		console.log(
			"=====Just got inside refresh method of refresh service with refresh token:",
			refreshToken,
		);

		console.log(
			"=====Verifying the refresh token with the help of refresh token secret",
		);

		let payload: any;

		try {
			payload = this.jwtService.verify(refreshToken, {
				secret: process.env.JWT_REFRESH_SECRET,
			});
		} catch {
			throw new UnauthorizedException("Invalid refresh token");
		}

		console.log("=====Refresh token verified");

		console.log(
			"=====Checking if the user exists with the help of user id stored in refresh token",
		);

		const user = await this.prisma.user.findUnique({
			where: { id: payload.sub },
		});

		console.log("=====User is found");

		console.log(
			"=====Checking if the user and the refresh token of the user exists in user table",
		);

		if (!user || !user.refreshTokenHash) {
			throw new BadRequestException("Invalid refresh token");
		}

		console.log("=====User and refresh token in the user table exists");

		console.log(
			"=====Checking if the refresh token is valid or not by comparing it with stored refresh token in user table",
		);

		const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);

		if (!valid) {
			throw new BadRequestException("Invalid refresh token");
		}

		console.log(
			"=====Refresh token matched with the stored refresh token in user table",
		);

		console.log("=====Checking if the user has tenant membership or not");

		const membership = await this.prisma.membership.findFirst({
			where: {
				userId: payload.sub,
				tenantId: payload.tenantId,
			},
		});

		if (!membership) {
			throw new BadRequestException("User has no tenant membership");
		}

		console.log("=====User has tenant membership");

		console.log(
			"=====Going to issue auth cookies method for generating access and refresh token",
		);

		await this.issueAuthCookies(
			res,
			user.id,
			payload.tenantId,
			membership.role,
		);

		console.log("=====Came back from issue auth cookies method");

		return { success: true };
	}

	async forgotPassword(dto: ForgotPasswordDto) {
		console.log(
			"=====Just got inside forgot password method of forgot password service with email:",
			dto.email,
		);

		console.log(
			"=====Checking if the user exists with the given email or else return",
		);

		const user = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		// Always return success (anti-enumeration)
		if (!user) {
			return { success: true };
		}

		console.log("=====User doesn't exists");

		console.log(
			"=====Generating random uuid raw token and hashing it after",
		);

		const rawToken = randomUUID();
		const tokenHash = await bcrypt.hash(rawToken, 10);

		console.log("=====Token is hashed");

		console.log(
			"=====Saving the user details with hashed token in password reset table before sending the token to the client through mail to check if the user is a valid user or not",
		);

		await this.prisma.passwordReset.create({
			data: {
				userId: user.id,
				tokenHash,
				expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
			},
		});

		console.log("=====User data is saved in password reset table");

		console.log(
			"=====Emitting send_email signal and template type to be RESET_PASSWORD to notification service",
		);

		this.emailClient.emit("send_email", {
			email: user.email,
			token: rawToken,
			template: "RESET_PASSWORD",
		});

		console.log("=====Reset password email sent to the user");

		return { success: true };
	}

	async resetPassword(dto: ResetPasswordDto) {
		console.log(
			"=====Just got inside reset password method of reset password service reset token:",
			dto.token,
		);

		console.log(
			"=====Checking if the password reset request expired or not in password reset table",
		);

		const resets = await this.prisma.passwordReset.findMany({
			where: { expiresAt: { gt: new Date() } },
			include: { user: true },
		});

		console.log(
			"=====Comparing if the token sent by client is sames as token stored in password reset table",
		);

		const resetEntry = await (async () => {
			for (const entry of resets) {
				const match = await bcrypt.compare(dto.token, entry.tokenHash);
				if (match) return entry;
			}
			return null;
		})();

		if (!resetEntry) {
			throw new BadRequestException("Invalid or expired reset token");
		}

		console.log(
			"=====Reset token is not expired and matches the token stored in password reset table",
		);

		console.log("=====Hashing new password provided by user");

		const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

		console.log("=====New password hashed");

		console.log("=====Updating user table with new hash password entry");

		await this.prisma.user.update({
			where: { id: resetEntry.userId },
			data: { passwordHash: newPasswordHash },
		});

		console.log("=====User table updated");

		console.log("=====Deleting user data from password reset table");

		await this.prisma.passwordReset.delete({
			where: { id: resetEntry.id },
		});

		console.log("=====User data deleted from password reset table");

		return { success: true };
	}

	async logout(userId: string, res: Response) {
		console.log("=====Just got inside logout model in logout service");

		console.log(
			"=====Updating the refresh token hash to null in user table",
		);

		await this.prisma.user.update({
			where: { id: userId },
			data: { refreshTokenHash: null },
		});

		console.log("=====Updated user table");

		console.log(
			"=====Clearing access and refresh token cookies from client side",
		);

		// Clear cookies
		res.clearCookie("access_token");
		res.clearCookie("refresh_token");

		console.log("=====Cleared both access and refresh token cookies");

		return { success: true };
	}

	async me(userId: string) {
		console.log("=====Just got inside me model of me service");

		console.log("=====Finding out user with userId");

		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			include: {
				memberships: {
					include: {
						tenant: true,
					},
				},
			},
		});

		if (!user) {
			throw new UnauthorizedException("You are not authorized");
		}

		console.log(
			"=====Got the unique user with tenants and sending the data to frontend",
		);

		return {
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				tenants: user.memberships.map((m) => ({
					id: m.tenantId,
					name: m.tenant.name,
					role: m.role,
				})),
			},
		};
	}
}
