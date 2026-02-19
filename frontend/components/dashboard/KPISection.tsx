"use client";

import KPICard from "./KPICard";

export default function KPISection() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
			<KPICard title="Active Incidents" value="12" color="bg-red-400" />
			<KPICard title="Open Alerts" value="38" color="bg-yellow-400" />
			<KPICard title="Resolved Today" value="5" color="bg-green-400" />
			<KPICard title="Integrations" value="4" color="bg-blue-400" />
		</div>
	);
}
