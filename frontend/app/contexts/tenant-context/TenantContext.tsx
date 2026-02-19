"use client";

import { createContext, useContext } from "react";

export const TenantContext = createContext<any>(null);

export function useTenant() {
	const context = useContext(TenantContext);
	if (!context) throw new Error("useTenant must be used inside provider");
	return context;
}
