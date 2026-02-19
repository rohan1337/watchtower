"use client";

import { TenantContext } from "./TenantContext";

export default function TenantProvider({
	tenant,
	children,
}: {
	tenant: any;
	children: React.ReactNode;
}) {
	return (
		<TenantContext.Provider value={{ tenant }}>
			{children}
		</TenantContext.Provider>
	);
}
