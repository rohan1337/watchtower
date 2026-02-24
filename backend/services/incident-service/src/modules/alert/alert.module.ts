import { Module } from "@nestjs/common";
import { AlertController } from "./alert.controller";
import { AlertService } from "./alert.service";
import { PrismaService } from "src/database/prisma.service";

@Module({
	controllers: [AlertController],
	providers: [AlertService, PrismaService],
})
export class AlertModule {}
