import { getSocket } from "./socket";
import { setAccessToken } from "./tokenStore";

let logoutHandler: (() => void) | null = null;

export function setLogoutHandler(fn: () => void) {
	logoutHandler = fn;
}

export function triggerLogout() {
	setAccessToken(null);

	const socket = getSocket();
	socket?.disconnect();

	window.location.href = "/login";
}
