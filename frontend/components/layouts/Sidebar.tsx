"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
	AlertTriangle,
	LayoutDashboard,
	Plug,
	Settings,
	ShieldAlert,
} from "lucide-react";

type Props = {
	slug: string;
};

export default function Sidebar({ slug }: Props) {
	const pathname = usePathname();

	const navItems = [
		{
			label: "Dashboard",
			href: `/${slug}/dashboard`,
			icon: <LayoutDashboard size={18} />,
		},
		{
			label: "Incidents",
			href: `/${slug}/incidents`,
			icon: <ShieldAlert size={18} />,
		},
		{
			label: "Alerts",
			href: `/${slug}/alerts`,
			icon: <AlertTriangle size={18} />,
		},
		{
			label: "Integrations",
			href: `/${slug}/integrations`,
			icon: <Plug size={18} />,
		},
		{
			label: "Settings",
			href: `/${slug}/settings`,
			icon: <Settings size={18} />,
		},
	];

	return (
		<aside className="flex h-screen w-64 flex-col border-r border-neutral-700 bg-white shadow-sm">
			<div className="flex h-16 items-center gap-1.5 px-4">
				<Image
					src="/Gemini_Generated_Image_cszqn0cszqn0cszq.png"
					alt="Watchtower Logo"
					width={28}
					height={28}
					priority
				/>
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
