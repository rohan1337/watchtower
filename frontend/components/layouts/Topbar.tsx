"use client";

import { useRouter } from "next/navigation";
import WorkspaceSwitcher from "@/components/topbar-button/WorkspaceSwitcher";
import { toast } from "sonner";

const BASE_URL_AUTH_SER = process.env.NEXT_PUBLIC_API_BASE_URL_AUTH_SER;

type Props = {
	tenantId: string;
	tenantName: string;
};

export default function Topbar({ tenantId }: Props) {
	const router = useRouter();

	const handleLogout = async () => {
		try {
			const res = await fetch(`${BASE_URL_AUTH_SER}/api/auth/logout`, {
				method: "POST",
				credentials: "include",
			});

			if (!res.ok) {
				toast.error("Failed to logout");
				throw new Error("Failed to logout");
			}

			toast.success("Logged out successfully!");
			router.replace("/login");
			router.refresh(); // optional, clears server state
		} catch (err) {
			console.error("Error while logging out:", err);
			toast.error("Error while logging out");
		}
	};

	return (
		<header className="flex h-16 items-center justify-between border-b border-neutral-700 bg-white px-6 py-4 shadow-sm">
			{/* Left: Workspace Switcher */}
			<WorkspaceSwitcher currentTenantId={tenantId} />

			{/* Right: Logout */}
			<div>
				<button
					onClick={handleLogout}
					className="text-sm text-red-600 cursor-pointer hover:underline"
				>
					Logout
				</button>
			</div>
		</header>
	);
}
