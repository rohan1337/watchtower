import { io, Socket } from "socket.io-client";
import { getAccessToken, subscribeToTokenChanges } from "./tokenStore";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL_INC_SER;

let socket: Socket | null = null;

export function initSocket() {
	if (socket) return socket; // 🔥 prevent duplicate connections

	const token = getAccessToken();
	if (!token) return null; // 🔥 return null instead of undefined

	socket = io(SOCKET_URL, {
		auth: { token },
		withCredentials: true,
	});

	subscribeToTokenChanges((newToken) => {
		if (!newToken || !socket) return;

		socket.auth = { token: newToken };
		socket.disconnect();
		socket.connect();
	});

	return socket;
}

export function getSocket() {
	return socket;
}
