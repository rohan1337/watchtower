"use client";

import { useTenant } from "@/app/contexts/tenant-context/TenantContext";
import KPISection from "@/components/dashboard/KPISection";
import SeveritySection from "@/components/dashboard/SeveritySection";
import RecentIncidents from "@/components/dashboard/RecentIncidents";

export default function DashboardPage() {
	const { tenant } = useTenant();

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-semibold text-neutral-900">
					Welcome to {tenant.name}
				</h1>
				<p className="text-neutral-600 mt-1">
					Overview of your incident and alert activity
				</p>
			</div>

			{/* Sections */}
			<KPISection />
			<SeveritySection />
			<RecentIncidents />
		</div>
	);
}
