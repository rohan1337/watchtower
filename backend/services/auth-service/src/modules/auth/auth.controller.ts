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
import { SelectWorkspaceDto } from "./dtos/select-workspace.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { PinoLogger } from "nestjs-pino";

@Controller("auth-ser/api/auth")
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(AuthController.name);
	}

	@Post("register")
	async register(@Body() dto: RegisterDto) {
		this.logger.info({ email: dto.email }, "Register request received");

		return this.authService.register(dto);
	}

	@Post("verify-email")
	async verifyEmail(
		@Body() dto: VerifyEmailDto,
		@Res({ passthrough: true }) res: Response,
	) {
		this.logger.info("Verify email request received");

		return this.authService.verifyEmail(dto, res);
	}

	@Post("login")
	login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
		this.logger.info({ email: dto.email }, "Login request received");

		return this.authService.login(dto, res);
	}

	@UseGuards(JwtAuthGuard)
	@Post("select-workspace")
	selectWorkspace(
		@Body() dto: SelectWorkspaceDto,
		@Req() req,
		@Res({ passthrough: true }) res: Response,
	) {
		this.logger.info(
			{
				userId: req.user.sub,
				tenantId: dto.tenantId,
			},
			"Select tenant request",
		);

		return this.authService.selectWorkspace(
			req.user.sub,
			dto.tenantId,
			res,
		);
	}

	@Post("refresh")
	refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
		const token = req.cookies?.refresh_token;

		if (!token) {
			this.logger.warn("Refresh attempted without token");
			throw new UnauthorizedException("No refresh token");
		}

		this.logger.info("Refresh token request received");

		return this.authService.refresh(token, res);
	}

	@Post("forgot-password")
	forgotPassword(@Body() dto: ForgotPasswordDto) {
		this.logger.info({ email: dto.email }, "Forgot password request");

		return this.authService.forgotPassword(dto);
	}

	@Post("reset-password")
	resetPassword(@Body() dto: ResetPasswordDto) {
		this.logger.info("Reset password request");

		return this.authService.resetPassword(dto);
	}

	@UseGuards(JwtAuthGuard)
	@Post("logout")
	logout(@Req() req, @Res({ passthrough: true }) res: Response) {
		const userId = req.user.sub;

		this.logger.info({ userId }, "Logout request");

		return this.authService.logout(userId, res);
	}

	@UseGuards(JwtAuthGuard)
	@Get("me")
	me(@Req() req) {
		this.logger.info({ userId: req.user.sub }, "Me endpoint accessed");

		return this.authService.me(req.user);
	}
}
