"use client";

import { useRouter } from "next/navigation";
import WorkspaceSwitcher from "@/components/dashboard/WorkspaceSwitcher";

const BASE_URL_AUTH_SER = process.env.NEXT_PUBLIC_API_BASE_URL_AUTH_SER;

type Props = {
	tenantId: string;
	tenantName: string;
};

export default function Topbar({ tenantId }: Props) {
	const router = useRouter();

	const handleLogout = async () => {
		await fetch(`${BASE_URL_AUTH_SER}/auth/logout`, {
			method: "POST",
			credentials: "include",
		});

		router.replace("/login");
	};

	return (
		<header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6">
			{/* Left: Workspace Switcher */}
			<WorkspaceSwitcher currentTenantId={tenantId} />

			{/* Right: Logout */}
			<div>
				<button
					onClick={handleLogout}
					className="text-sm text-red-600 hover:underline"
				>
					Logout
				</button>
			</div>
		</header>
	);
}
