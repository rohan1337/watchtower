import * as crypto from "crypto";
import { PinoLogger } from "nestjs-pino";

function normalizeMessage(message: string) {
	return message
		.toLowerCase()
		.trim()
		.replace(/\d+\.\d+\.\d+\.\d+/g, "IP")
		.replace(/\d+/g, "NUM")
		.replace(/\s+/g, " "); // collapse multiple spaces
}

function normalizeSource(source: string) {
	return source?.toLowerCase().trim() ?? "unknown";
}

export function generateFingerprint(
	source: string,
	message: string,
	logger?: PinoLogger,
): string {
	const normalizedSource = normalizeSource(source);
	const normalizedMessage = normalizeMessage(message);

	const fingerprint = crypto
		.createHash("sha256")
		.update(`${normalizedSource}-${normalizedMessage}`)
		.digest("hex");

	if (logger) {
		logger.debug(
			{
				source,
				normalizedSource,
				normalizedMessage,
				fingerprint,
			},
			"Generated fingerprint for event",
		);
	}

	return fingerprint;
}
