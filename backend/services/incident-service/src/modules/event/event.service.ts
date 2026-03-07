import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateEventDto } from "./dtos/create-event.dto";
import { EventProcessor } from "./event.processor";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class EventService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly processor: EventProcessor,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(EventService.name);
	}

	async create(dto: CreateEventDto, user: any) {
		this.logger.info(
			{
				tenantId: user.tenantId,
				source: dto.source,
				service: dto.service,
			},
			"Creating event",
		);

		const event = await this.prisma.event.create({
			data: {
				...dto,
				tenantId: user.tenantId,
			},
		});

		this.logger.debug({ eventId: event.id }, "Event stored in database");

		await this.processor.process(event);

		this.logger.debug({ eventId: event.id }, "Event processing completed");

		return event;
	}
}
