import { BadRequestException, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../database/prisma.service";
import { RegisterDto } from "./dtos/register.dto";
import { LoginDto } from "./dtos/login.dto";
import { ForgotPasswordDto } from "./dtos/forgot-password.dto";
import { ResetPasswordDto } from "./dtos/reset-password.dto";
import { randomUUID } from "crypto";

@Injectable()
export class AuthService {
	constructor(private readonly prisma: PrismaService) {}

	async register(dto: RegisterDto) {
		console.log(
			"=====Just got inside register method of AuthService with email:",
			dto.email,
		);

		const existingUser = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		if (existingUser) {
			throw new BadRequestException("Email already registered");
		}

		console.log(
			"=====No existing user found, proceeding to has password for email:",
			dto.email,
		);

		const passwordHash = await bcrypt.hash(dto.password, 10);

		console.log(
			"=====Password hashed, creating user for email:",
			dto.email,
		);

		const user = await this.prisma.user.create({
			data: {
				email: dto.email,
				passwordHash,
				name: dto.name,
			},
		});

		console.log("=====User created with ID:", user.id);

		return {
			id: user.id,
			email: user.email,
			name: user.name,
			createdAt: user.createdAt,
		};
	}

	async login(dto: LoginDto) {
		const user = await this.prisma.user.findUnique({
			where: { email: dto.email },
			include: { memberships: true },
		});

		if (!user || !user.passwordHash) {
			throw new BadRequestException("Invalid credentials");
		}

		const isValid = await bcrypt.compare(dto.password, user.passwordHash);

		if (!isValid) {
			throw new BadRequestException("Invalid credentials");
		}

		return {
			userId: user.id,
			tenants: user.memberships.map((m) => ({
				tenantId: m.tenantId,
				role: m.role,
			})),
		};
	}

	async forgotPassword(dto: ForgotPasswordDto) {
		const user = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		// Security best practice:
		// Always return success even if user does not exist
		if (!user) {
			return { success: true };
		}

		const resetToken = randomUUID();

		// TEMPORARY approach (will improve later)
		await this.prisma.user.update({
			where: { id: user.id },
			data: {
				passwordHash: resetToken,
			},
		});

		// Later → send email via notification-service
		console.log("Password reset token:", resetToken);

		return { success: true };
	}

	async resetPassword(dto: ResetPasswordDto) {
		const user = await this.prisma.user.findFirst({
			where: {
				passwordHash: dto.token,
			},
		});

		if (!user) {
			throw new BadRequestException("Invalid or expired token");
		}

		const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

		await this.prisma.user.update({
			where: { id: user.id },
			data: {
				passwordHash: newPasswordHash,
			},
		});

		return { success: true };
	}
}
