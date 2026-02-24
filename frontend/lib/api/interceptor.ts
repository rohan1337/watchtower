import { AxiosInstance } from "axios";
import { authApi } from "./authApi";
import { triggerLogout } from "../logout";

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

export function applyAuthInterceptor(instance: AxiosInstance) {
	instance.interceptors.response.use(
		(response) => response,
		async (error) => {
			const originalRequest = error.config;

			if (
				error.response?.status === 401 &&
				!originalRequest._retry &&
				!originalRequest.url?.includes("/auth/refresh")
			) {
				originalRequest._retry = true;

				try {
					// If no refresh happening → start one
					if (!isRefreshing) {
						isRefreshing = true;

						refreshPromise = authApi
							.post("/auth/refresh")
							.then(() => {
								isRefreshing = false;
								refreshPromise = null;
							})
							.catch((err) => {
								isRefreshing = false;
								refreshPromise = null;
								throw err;
							});
					}

					// Wait for ongoing refresh
					await refreshPromise;

					// Retry original request
					return instance(originalRequest);
				} catch (err) {
					triggerLogout();
					return Promise.reject(err);
				}
			}

			return Promise.reject(error);
		},
	);
}
