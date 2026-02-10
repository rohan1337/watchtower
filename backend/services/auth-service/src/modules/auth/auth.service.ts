import {
	BadRequestException,
	Inject,
	Injectable,
	OnModuleInit,
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

@Injectable()
export class AuthService implements OnModuleInit {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
		@Inject("EMAIL_SERVICE") private readonly emailClient: ClientProxy,
	) {}

	private generateAccessToken(userId: string) {
		console.log("=====Just got inside generate access token function");

		console.log(
			"=====Generating access token with the help of jwt service where user id, jwt access secret, and expiry date of 15m is stored in access token",
		);

		return this.jwtService.sign(
			{ sub: userId },
			{
				secret: process.env.JWT_ACCESS_SECRET,
				expiresIn: "15m",
			},
		);
	}

	private generateRefreshToken(userId: string) {
		console.log("=====Just got inside generate refresh token function");

		console.log(
			"=====Generating refresh token with the help of jwt service where user id, jwt refresh secret, and expiry date of 7d is stored in refresh token",
		);

		return this.jwtService.sign(
			{ sub: userId },
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

		await this.prisma.emailVerification.upsert({
			where: { email: dto.email },
			update: {
				name: dto.name,
				password: hashedPassword,
				token,
				expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
			},
			create: {
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

	async verifyEmail(dto: VerifyEmailDto) {
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

		console.log("=====Registering user now in user table");

		// Create the real user now
		await this.prisma.user.create({
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

		console.log("=====Generating access and refresh token");

		const accessToken = this.generateAccessToken(user.id);
		const refreshToken = this.generateRefreshToken(user.id);

		console.log("=====Access and refresh token generated");

		// Store hashed refresh token
		const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

		console.log(
			"=====Refresh token is hashed and is going to be updated in the user table",
		);

		await this.prisma.user.update({
			where: { id: user.id },
			data: { refreshTokenHash },
		});

		console.log("=====Refresh token is updated in user table");

		console.log(
			"=====Generating cookies to be stored in frontend with the help of access and refresh token which are http only, same site is lax",
		);

		// 🔐 Cookies
		res.cookie("access_token", accessToken, {
			httpOnly: true,
			sameSite: "lax",
			secure: false, // true in production
			maxAge: 15 * 60 * 1000, // 15 mins
		});

		res.cookie("refresh_token", refreshToken, {
			httpOnly: true,
			sameSite: "lax",
			secure: false,
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		console.log(
			"=====Generated access token (validity 15m) and refresh token (validity 7d) cookies",
		);

		return {
			accessToken,
			refreshToken,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
		};
	}

	async refresh(refreshToken: string, res: Response) {
		console.log(
			"=====Just got inside refresh method of refresh service with refresh token:",
			refreshToken,
		);

		console.log(
			"=====Verifying the refresh token with the help of refresh token secret",
		);

		const payload = this.jwtService.verify(refreshToken, {
			secret: process.env.JWT_REFRESH_SECRET,
		});

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

		console.log("=====New access token is getting generated");

		const newAccessToken = this.generateAccessToken(user.id);

		console.log("=====New access token is generated");

		console.log(
			"=====Generating cookie to be stored in frontend with the help of access token which is http only, same site is lax",
		);

		res.cookie("access_token", newAccessToken, {
			httpOnly: true,
			sameSite: "lax",
			secure: false,
			maxAge: 15 * 60 * 1000,
		});

		console.log("=====Generated access token (validity 15m) cookie");

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
}
