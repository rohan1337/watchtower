import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Injectable,
} from "@nestjs/common";
import { Request, Response } from "express";
import { PinoLogger } from "nestjs-pino";

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
	constructor(private readonly logger: PinoLogger) {
		this.logger.setContext(GlobalExceptionFilter.name);
	}

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();

		const request = ctx.getRequest<Request>();
		const response = ctx.getResponse<Response>();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = "Internal server error";

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const res = exception.getResponse();
			message =
				typeof res === "string"
					? res
					: (res as any).message || exception.message;
		}

		this.logger.error(
			{
				err: exception,
				method: request.method,
				url: request.url,
				userId: (request as any)?.user?.sub,
			},
			"Unhandled exception",
		);

		response.status(status).json({
			success: false,
			statusCode: status,
			message,
			timestamp: new Date().toISOString(),
			path: request.url,
		});
	}
}
