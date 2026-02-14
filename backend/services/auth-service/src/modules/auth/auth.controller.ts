import {
	Body,
	Controller,
	Get,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dtos/register.dto";
import { VerifyEmailDto } from "./dtos/verify-email.dto";
import { LoginDto } from "./dtos/login.dto";
import { ForgotPasswordDto } from "./dtos/forgot-password.dto";
import { ResetPasswordDto } from "./dtos/reset-password.dto";
import type { Response } from "express";
import { SelectTenantDto } from "./dtos/select-tenant.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

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
	async verifyEmail(
		@Body() dto: VerifyEmailDto,
		@Res({ passthrough: true }) res: Response,
	) {
		console.log(
			"=====Just got inside verify email method of verify email controller",
		);
		return this.authService.verifyEmail(dto, res);
	}

	@Post("login")
	login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
		console.log(
			"=====Just got inside login method of login controller with email:",
			dto.email,
		);
		return this.authService.login(dto, res);
	}

	@UseGuards(JwtAuthGuard)
	@Post("select-tenant")
	selectTenant(
		@Body() dto: SelectTenantDto,
		@Req() req,
		@Res({ passthrough: true }) res: Response,
	) {
		return this.authService.selectTenant(req.user.sub, dto.tenantId, res);
	}

	@Post("refresh")
	refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
		console.log(
			"=====Just got inside refresh method of refresh controller with refresh token:",
			req.cookies?.refresh_token,
		);
		const token = req.cookies?.refresh_token;
		if (!token) {
			throw new UnauthorizedException("No refresh token");
		}
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

	@UseGuards(JwtAuthGuard)
	@Post("logout")
	logout(@Req() req, @Res({ passthrough: true }) res: Response) {
		console.log("=====Just got inside logout method of logout controller");
		const userId = req.user.sub;
		return this.authService.logout(userId, res);
	}

	@UseGuards(JwtAuthGuard)
	@Get("me")
	me(@Req() req) {
		return this.authService.me(req.user.sub);
	}
}
