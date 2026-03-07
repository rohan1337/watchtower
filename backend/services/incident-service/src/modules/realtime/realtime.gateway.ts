import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { PinoLogger } from "nestjs-pino";

@WebSocketGateway({
	cors: {
		origin: "http://localhost:3000",
		credentials: true,
	},
})
export class RealtimeGateway implements OnGatewayConnection {
	@WebSocketServer()
	server: Server;

	constructor(
		private jwtService: JwtService,
		private readonly logger: PinoLogger,
	) {
		this.logger.setContext(RealtimeGateway.name);
	}

	async handleConnection(client: any) {
		this.logger.debug(
			{ socketId: client.id },
			"Client attempting websocket connection",
		);

		try {
			const token = client.handshake.auth?.token;

			if (!token) {
				this.logger.warn(
					{ socketId: client.id },
					"WebSocket connection rejected: missing token",
				);
				client.disconnect();
				return;
			}

			const payload = this.jwtService.verify(token);

			const tenantId = payload.tenantId;
			const exp = payload.exp;

			if (!tenantId || !exp) {
				this.logger.warn(
					{ socketId: client.id },
					"WebSocket connection rejected: invalid token payload",
				);
				client.disconnect();
				return;
			}

			client.join(tenantId);

			this.logger.info(
				{ socketId: client.id, tenantId },
				"Client joined tenant room",
			);

			const expiresInMs = exp * 1000 - Date.now();

			if (expiresInMs <= 0) {
				this.logger.warn(
					{ socketId: client.id },
					"Token expired during connection",
				);
				client.disconnect();
				return;
			}

			setTimeout(() => {
				this.logger.info(
					{ socketId: client.id, tenantId },
					"Disconnecting client due to token expiration",
				);

				client.disconnect(true);
			}, expiresInMs);
		} catch (error) {
			this.logger.error(
				{ err: error, socketId: client.id },
				"WebSocket authentication failed",
			);

			client.disconnect();
		}
	}
}
