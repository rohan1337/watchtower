"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

const BASE_URL_AUTH_SER = process.env.NEXT_PUBLIC_API_BASE_URL_AUTH_SER;

type Tenant = {
	id: string;
	name: string;
	role: string;
	slug: string;
};

type Props = {
	currentTenantId: string;
};

export default function WorkspaceSwitcher({ currentTenantId }: Props) {
	const [tenants, setTenants] = useState<Tenant[]>([]);
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchTenants = async () => {
			const res = await fetch(`${BASE_URL_AUTH_SER}/auth/me`, {
				credentials: "include",
			});

			if (!res.ok) return;

			const data = await res.json();
			setTenants(data.user.tenants);
		};

		fetchTenants();
	}, []);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSelect = async (tenant: Tenant) => {
		await fetch(`${BASE_URL_AUTH_SER}/auth/select-workspace`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ tenantId: tenant.id }),
		});

		setOpen(false);
		router.replace(`/${tenant.slug}/dashboard`);
	};

	const currentTenant = tenants.find((t) => t.id === currentTenantId);

	return (
		<div className="relative" ref={ref}>
			<button
				onClick={() => setOpen((v) => !v)}
				className="flex items-center gap-2 rounded-md border border-neutral-700 cursor-pointer bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-all duration-200 ease-in-out hover:bg-neutral-100"
			>
				<span>{currentTenant?.name || "Workspace"}</span>
				<ChevronDown
					size={16}
					className={`transition-transform duration-200 ease-in-out ${
						open ? "rotate-180" : "rotate-0"
					}`}
				/>
			</button>

			{open && (
				<div className="absolute right-0 mt-2 w-48 p-2 rounded-md border border-neutral-700 bg-white shadow-lg">
					{tenants.map((tenant) => (
						<button
							key={tenant.id}
							onClick={() => handleSelect(tenant)}
							className={`block w-full px-4 py-2 rounded-sm text-left text-sm text-neutral-700 cursor-pointer hover:bg-neutral-100 ${
								tenant.id === currentTenantId
									? "bg-neutral-100 font-medium"
									: ""
							}`}
						>
							{tenant.name}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
