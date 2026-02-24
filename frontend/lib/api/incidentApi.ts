import axios from "axios";
import { applyAuthInterceptor } from "./interceptor";

export const incidentApi = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_BASE_URL_INC_SER,
	withCredentials: true,
});

// attach interceptor
applyAuthInterceptor(incidentApi);
