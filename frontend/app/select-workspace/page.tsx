"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { setAccessToken } from "@/lib/tokenStore";
import { initSocket } from "@/lib/socket";

const BASE_URL_AUTH_SER = process.env.NEXT_PUBLIC_API_BASE_URL_AUTH_SER;

type Tenant = {
	id: string;
	name: string;
	slug: string;
	role: string;
};

export default function SelectWorkspacePage() {
	const { user, loading } = useAuth();
	const [selecting, setSelecting] = useState<string | null>(null);
	const [initializing, setInitializing] = useState(true);
	const [hasAutoSelected, setHasAutoSelected] = useState(false);

	const router = useRouter();

	useEffect(() => {
		if (loading) return;

		if (!user) {
			router.replace("/login");
			return;
		}

		if (!user.tenants || user.tenants.length === 0) {
			router.replace("/create-workspace");
			return;
		}

		// Only one workspace → auto activate
		if (user.tenants.length === 1 && !hasAutoSelected) {
			setHasAutoSelected(true);
			autoSelectWorkspace(user.tenants[0]);
			return;
		}

		// Multiple workspaces → show selection
		setInitializing(false);
	}, [user, loading]);

	const autoSelectWorkspace = async (tenant: Tenant) => {
		try {
			const res = await fetch(
				`${BASE_URL_AUTH_SER}/auth/select-workspace`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ tenantId: tenant.id }),
				},
			);

			if (!res.ok) throw new Error();

			const data = await res.json();

			setAccessToken(data.accessToken);
			initSocket();

			router.replace(`/${tenant.slug}/dashboard`);
		} catch {
			router.replace("/login");
		}
	};

	const handleSelect = async (tenant: Tenant) => {
		try {
			setSelecting(tenant.id);
			setInitializing(true);

			const res = await fetch(
				`${BASE_URL_AUTH_SER}/auth/select-workspace`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ tenantId: tenant.id }),
				},
			);

			if (!res.ok) {
				throw new Error("Failed to select tenant");
			}

			const data = await res.json();

			// Backend should return new tenant-scoped access token
			setAccessToken(data.accessToken);

			// Reconnect socket with new token
			initSocket();

			router.replace(`/${tenant.slug}/dashboard`);
		} catch (err: any) {
			toast.error(err.message || "Something went wrong");
		} finally {
			setSelecting(null);
		}
	};

	if (loading) {
		return (
			<div className="h-screen flex items-center justify-center">
				<p className="text-neutral-700">Loading workspaces...</p>
			</div>
		);
	}

	if (initializing) {
		return (
			<div className="h-screen flex items-center justify-center bg-neutral-100">
				<p className="text-neutral-700">Loading dashboard...</p>
			</div>
		);
	}

	return (
		<div className="h-screen bg-neutral-100 flex items-center justify-center">
			<div className="bg-white shadow-sm rounded-lg p-6 w-full max-w-md">
				<h2 className="text-xl font-semibold text-neutral-900 mb-6">
					Select Your Workspace
				</h2>

				<div className="space-y-3">
					{user?.tenants.map((tenant) => (
						<button
							key={tenant.id}
							onClick={() => handleSelect(tenant)}
							disabled={selecting === tenant.id}
							className="w-full border border-neutral-700 rounded-md px-3 py-3 text-left cursor-pointer hover:bg-neutral-50 hover:border-neutral-900"
						>
							<div className="flex justify-between items-center">
								<span className="text-sm text-neutral-700">
									{tenant.name}
								</span>
								<span className="text-sm text-neutral-500">
									{tenant.role === "OWNER"
										? "Owner"
										: tenant.role === "ADMIN"
											? "Admin"
											: tenant.role === "MEMBER"
												? "Member"
												: null}
								</span>
							</div>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
