import axios from "axios";
import { applyAuthInterceptor } from "./interceptor";

export const authApi = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_BASE_URL_AUTH_SER,
	withCredentials: true,
});

// attach interceptor
applyAuthInterceptor(authApi);
