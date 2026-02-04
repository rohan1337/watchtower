"use client";

import { usePathname, useParams } from "next/navigation";
import { Bell, ChevronDown, CircleUser, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";

const Topbar = () => {
	const [open, setOpen] = useState(false);

	const pathname = usePathname();
	const params = useParams();

	const tenantId = params?.tenantId as string;

	const ref = useRef<HTMLDivElement>(null);

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

	// Derive page title from route
	const pageTitle = (() => {
		if (pathname.includes("/dashboard")) return "Dashboard";
		if (pathname.includes("/incidents")) return "Incidents";
		if (pathname.includes("/alerts")) return "Alerts";
		if (pathname.includes("/integrations")) return "Integrations";
		if (pathname.includes("/settings")) return "Settings";
		return "Watchtower";
	})();

	return (
		<header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6">
			{/* Left: Page title */}
			<div className="flex items-center gap-4">
				<h1 className="text-lg font-semibold text-neutral-900">
					{pageTitle}
				</h1>
			</div>

			{/* Center: Tenant switcher (mock) */}
			<div className="hidden md:flex">
				<button className="flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100">
					<span className="truncate max-w-30">
						{tenantId ?? "Select tenant"}
					</span>
					<ChevronDown size={16} />
				</button>
			</div>

			{/* Right: Actions */}
			<div className="flex items-center gap-4">
				{/* Search (future use) */}
				<button
					className="rounded-md p-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
					title="Search"
				>
					<Search size={18} />
				</button>

				{/* Notifications */}
				<div className="relative" ref={ref}>
					<button
						onClick={() => setOpen((v) => !v)}
						className="relative rounded-md p-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
					>
						<Bell size={18} />
						<span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-600" />
					</button>

					{open && <NotificationDropdown />}
				</div>

				{/* User menu */}
				<button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-neutral-100">
					<CircleUser size={22} className="text-neutral-700" />
					<ChevronDown size={16} className="text-neutral-500" />
				</button>
			</div>
		</header>
	);
};

export default Topbar;
