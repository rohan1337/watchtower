"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

const BASE_URL_AUTH_SER = process.env.NEXT_PUBLIC_API_BASE_URL_AUTH_SER;

export default function SelectWorkspacePage() {
	const { user, loading } = useAuth();
	const [selecting, setSelecting] = useState<string | null>(null);
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

		if (user.tenants.length === 1) {
			autoSelectWorkspace(user.tenants[0].id);
		}
	}, [user, loading]);

	const autoSelectWorkspace = async (tenantId: string) => {
		try {
			const res = await fetch(
				`${BASE_URL_AUTH_SER}/auth/select-workspace`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ tenantId }),
				},
			);

			if (!res.ok) throw new Error();

			// IMPORTANT: small micro-delay to ensure cookie is stored
			await new Promise((resolve) => setTimeout(resolve, 50));

			router.replace(`/${tenantId}/dashboard`);
		} catch {
			router.replace("/login");
		}
	};

	const handleSelect = async (tenantId: string) => {
		try {
			setSelecting(tenantId);

			const res = await fetch(
				`${BASE_URL_AUTH_SER}/auth/select-workspace`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ tenantId }),
				},
			);

			if (!res.ok) {
				throw new Error("Failed to select tenant");
			}

			router.replace(`/${tenantId}/dashboard`);
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
							onClick={() => handleSelect(tenant.id)}
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
