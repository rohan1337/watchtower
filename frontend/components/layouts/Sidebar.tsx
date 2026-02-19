"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	AlertTriangle,
	Bell,
	LayoutDashboard,
	Plug,
	Settings,
	ShieldAlert,
} from "lucide-react";

type Props = {
	tenantId: string;
};

export default function Sidebar({ tenantId }: Props) {
	const pathname = usePathname();

	const navItems = [
		{
			label: "Dashboard",
			href: `/${tenantId}/dashboard`,
			icon: <LayoutDashboard size={18} />,
		},
		{
			label: "Incidents",
			href: `/${tenantId}/incidents`,
			icon: <ShieldAlert size={18} />,
		},
		{
			label: "Alerts",
			href: `/${tenantId}/alerts`,
			icon: <AlertTriangle size={18} />,
		},
		{
			label: "Integrations",
			href: `/${tenantId}/integrations`,
			icon: <Plug size={18} />,
		},
		{
			label: "Settings",
			href: `/${tenantId}/settings`,
			icon: <Settings size={18} />,
		},
	];

	return (
		<aside className="flex h-screen w-64 flex-col border-r border-neutral-700 bg-white shadow-sm">
			<div className="flex h-16 items-center px-6">
				<Bell className="mr-2 text-red-600" />
				<span className="text-lg font-semibold text-neutral-900">
					Watchtower
				</span>
			</div>

			<nav className="flex-1 px-4 py-4">
				<ul className="space-y-1">
					{navItems.map((item) => {
						const isActive = pathname.startsWith(item.href);

						return (
							<li key={item.label}>
								<Link
									href={item.href}
									className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
										isActive
											? "bg-neutral-900 text-white"
											: "text-neutral-700 hover:bg-neutral-100"
									}`}
								>
									{item.icon}
									{item.label}
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>
		</aside>
	);
}
