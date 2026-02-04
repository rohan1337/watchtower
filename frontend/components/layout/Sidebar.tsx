"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
	AlertTriangle,
	Bell,
	LayoutDashboard,
	Plug,
	Settings,
	ShieldAlert,
} from "lucide-react";

type NavItem = {
	label: string;
	href: (tenantId: string) => string;
	icon: React.ReactNode;
};

const Sidebar = () => {
	const pathname = usePathname();
	const params = useParams();

	const tenantId = params?.tenantId as string;

	const navItems: NavItem[] = [
		{
			label: "Dashboard",
			href: (t) => `/app/${t}/dashboard`,
			icon: <LayoutDashboard size={18} />,
		},
		{
			label: "Incidents",
			href: (t) => `/app/${t}/incidents`,
			icon: <ShieldAlert size={18} />,
		},
		{
			label: "Alerts",
			href: (t) => `/app/${t}/alerts`,
			icon: <AlertTriangle size={18} />,
		},
		{
			label: "Integrations",
			href: (t) => `/app/${t}/integrations`,
			icon: <Plug size={18} />,
		},
		{
			label: "Settings",
			href: (t) => `/app/${t}/settings`,
			icon: <Settings size={18} />,
		},
	];

	return (
		<aside className="flex h-screen w-64 flex-col border-r border-neutral-200 bg-white">
			{/* Logo / Brand */}
			<div className="flex h-16 items-center border-b border-neutral-200 px-6">
				<Bell className="mr-2 text-red-600" />
				<span className="text-lg font-semibold text-neutral-900">
					Watchtower
				</span>
			</div>

			{/* Navigation */}
			<nav className="flex-1 px-4 py-4">
				<ul className="space-y-1">
					{navItems.map((item) => {
						const href = tenantId ? item.href(tenantId) : "#";
						const isActive = pathname === href;

						return (
							<li key={item.label}>
								<Link
									href={href}
									className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                    ${
						isActive
							? "bg-neutral-900 text-white"
							: "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
					}
                  `}
								>
									<span
										className={`${
											isActive
												? "text-white"
												: "text-neutral-500"
										}`}
									>
										{item.icon}
									</span>
									{item.label}
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			{/* Footer / Tenant Info */}
			<div className="border-t border-neutral-200 px-4 py-3 text-xs text-neutral-500">
				<div className="flex items-center justify-between">
					<span>Tenant</span>
					<span className="font-medium text-neutral-800">
						{tenantId ?? "—"}
					</span>
				</div>
			</div>
		</aside>
	);
};

export default Sidebar;
