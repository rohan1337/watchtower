let accessToken: string | null = null;

type Listener = (token: string | null) => void;
let listeners: Listener[] = [];

export function setAccessToken(token: string | null) {
	accessToken = token;
	listeners.forEach((l) => l(token));
}

export function getAccessToken() {
	return accessToken;
}

export function subscribeToTokenChanges(listener: Listener) {
	listeners.push(listener);

	return () => {
		listeners = listeners.filter((l) => l !== listener);
	};
}
