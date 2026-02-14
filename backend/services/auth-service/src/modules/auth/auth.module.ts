import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrismaService } from "../../database/prisma.service";
import { CleanupService } from "./cleanup.service";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { PassportModule } from "@nestjs/passport";

@Module({
	imports: [
		ClientsModule.register([
			{
				name: "EMAIL_SERVICE",
				transport: Transport.REDIS,
				options: {
					host: process.env.REDIS_HOST || "localhost",
					port: Number(process.env.REDIS_PORT) || 6379,
				},
			},
		]),
		JwtModule.register({
			secret: process.env.JWT_ACCESS_SECRET,
			signOptions: { expiresIn: "15m" },
		}),
		PassportModule,
	],
	controllers: [AuthController],
	providers: [AuthService, PrismaService, CleanupService, JwtStrategy],
})
export class AuthModule {}
