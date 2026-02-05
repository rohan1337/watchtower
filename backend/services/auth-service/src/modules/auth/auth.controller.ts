import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dtos/register.dto";
import { LoginDto } from "./dtos/login.dto";
import { ForgotPasswordDto } from "./dtos/forgot-password.dto";
import { ResetPasswordDto } from "./dtos/reset-password.dto";

@Controller("api/auth")
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

	@Post("login")
	login(@Body() dto: LoginDto) {
		console.log(
			"=====Just got inside login method of login controller with email:",
			dto.email,
		);
		return this.authService.login(dto);
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
