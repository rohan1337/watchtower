let logoutHandler: (() => void) | null = null;

export function setLogoutHandler(fn: () => void) {
	logoutHandler = fn;
}

export function triggerLogout() {
	if (logoutHandler) {
		logoutHandler();
	}
}
