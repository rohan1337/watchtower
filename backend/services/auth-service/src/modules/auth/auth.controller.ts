import { Body, Controller, Post, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dtos/register.dto";
import { VerifyEmailDto } from "./dtos/verify-email.dto";
import { LoginDto } from "./dtos/login.dto";
import { ForgotPasswordDto } from "./dtos/forgot-password.dto";
import { ResetPasswordDto } from "./dtos/reset-password.dto";
import type { Response } from "express";

@Controller("auth-ser/api/auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("register")
	async register(@Body() dto: RegisterDto) {
		console.log(
			"=====Just got inside register method of register controller with email:",
			dto.email,
		);
		return this.authService.register(dto);
	}

	@Post("verify-email")
	async verifyEmail(@Body() dto: VerifyEmailDto) {
		console.log(
			"=====Just got inside verify email method of verify email controller",
		);
		return this.authService.verifyEmail(dto);
	}

	@Post("login")
	login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
		console.log(
			"=====Just got inside login method of login controller with email:",
			dto.email,
		);
		return this.authService.login(dto, res);
	}

	@Post("refresh")
	refresh(
		@Body("refreshToken") token: string,
		@Res({ passthrough: true }) res: Response,
	) {
		console.log(
			"=====Just got inside refresh method of refresh controller with refresh token:",
			token,
		);
		return this.authService.refresh(token, res);
	}

	@Post("forgot-password")
	forgotPassword(@Body() dto: ForgotPasswordDto) {
		console.log(
			"=====Just got inside forgotPassword method of forgot-password controller",
		);
		return this.authService.forgotPassword(dto);
	}

	@Post("reset-password")
	resetPassword(@Body() dto: ResetPasswordDto) {
		console.log(
			"=====Just got inside resetPassword method of reset-password controller",
		);
		return this.authService.resetPassword(dto);
	}
}
