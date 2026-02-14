"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const BASE_URL_AUTH_SER = process.env.NEXT_PUBLIC_API_BASE_URL_AUTH_SER;

type Tenant = {
	id: string;
	name: string;
	role: string;
};

export default function SelectTenantPage() {
	const [tenants, setTenants] = useState<Tenant[]>([]);
	const [loading, setLoading] = useState(true);
	const [selecting, setSelecting] = useState<string | null>(null);

	const router = useRouter();

	useEffect(() => {
		const fetchTenants = async () => {
			try {
				const res = await fetch(`${BASE_URL_AUTH_SER}/auth/me`, {
					credentials: "include",
				});

				if (!res.ok) throw new Error("Unauthorized");

				const data = await res.json();
				const userTenants = data.user.tenants || [];

				if (userTenants.length === 0) {
					router.replace("/create-workspace");
					return;
				}

				if (userTenants.length === 1) {
					await handleSelect(userTenants[0].id);
					return;
				}

				setTenants(userTenants);
			} catch {
				router.replace("/login");
			} finally {
				setLoading(false);
			}
		};

		fetchTenants();
	}, []);

	const handleSelect = async (tenantId: string) => {
		try {
			setSelecting(tenantId);

			const res = await fetch(`${BASE_URL_AUTH_SER}/auth/select-tenant`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ tenantId }),
			});

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
			<div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
				<h2 className="text-xl font-semibold text-neutral-800 mb-6">
					Select Your Workspace
				</h2>

				<div className="space-y-3">
					{tenants.map((tenant) => (
						<button
							key={tenant.id}
							onClick={() => handleSelect(tenant.id)}
							disabled={selecting === tenant.id}
							className="w-full border rounded-md px-4 py-3 text-left hover:bg-neutral-50 transition"
						>
							<div className="flex justify-between items-center">
								<span className="font-medium">
									{tenant.name}
								</span>
								<span className="text-sm text-neutral-500">
									{tenant.role}
								</span>
							</div>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
