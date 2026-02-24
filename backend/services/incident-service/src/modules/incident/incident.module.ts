import { Module } from "@nestjs/common";
import { IncidentController } from "./incident.controller";
import { IncidentService } from "./incident.service";
import { PassportModule } from "@nestjs/passport";
import { PrismaService } from "src/database/prisma.service";
import { JwtStrategy } from "../strategies/jwt.strategy";
import { HttpModule } from "@nestjs/axios";

@Module({
	imports: [PassportModule, HttpModule],
	controllers: [IncidentController],
	providers: [IncidentService, PrismaService, JwtStrategy],
})
export class IncidentModule {}
