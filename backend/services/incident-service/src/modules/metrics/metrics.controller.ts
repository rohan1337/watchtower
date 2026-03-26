import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "express";
import * as client from "prom-client";

@Controller()
export class MetricsController {
	constructor() {
		client.collectDefaultMetrics();
	}

	@Get("metrics")
	async metrics(@Res() res: Response) {
		res.set("Content-Type", client.register.contentType);
		res.end(await client.register.metrics());
	}
}
