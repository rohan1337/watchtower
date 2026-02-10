"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, ShieldAlert, Activity, Clock } from "lucide-react";

const stats = [
	{
		label: "Active Incidents",
		value: 3,
		icon: <ShieldAlert className="text-red-600" size={20} />,
		bg: "bg-red-50",
	},
	{
		label: "Open Alerts",
		value: 14,
		icon: <AlertTriangle className="text-yellow-600" size={20} />,
		bg: "bg-yellow-50",
	},
	{
		label: "Resolved Today",
		value: 27,
		icon: <Activity className="text-green-600" size={20} />,
		bg: "bg-green-50",
	},
	{
		label: "Avg Resolution Time",
		value: "42m",
		icon: <Clock className="text-blue-600" size={20} />,
		bg: "bg-blue-50",
	},
];

const activeIncidents = [
	{
		id: "inc-101",
		title: "Payment gateway latency",
		severity: "Critical",
		status: "Investigating",
		updatedAt: "5 min ago",
	},
	{
		id: "inc-102",
		title: "Webhook delivery failures",
		severity: "High",
		status: "Identified",
		updatedAt: "18 min ago",
	},
	{
		id: "inc-103",
		title: "Email notifications delayed",
		severity: "Medium",
		status: "Monitoring",
		updatedAt: "32 min ago",
	},
];

const recentAlerts = [
	{
		id: "al-201",
		message: "CPU usage > 85% on worker-3",
		time: "2 min ago",
	},
	{
		id: "al-202",
		message: "Redis connection retries detected",
		time: "12 min ago",
	},
	{
		id: "al-203",
		message: "API error rate increased (5xx)",
		time: "26 min ago",
	},
];

const DashboardPage = () => {
	const params = useParams();
	const tenantId = params?.tenantId as string;

	return (
		<div className="space-y-8">
			{/* Stats */}
			<section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => (
					<div
						key={stat.label}
						className={`rounded-lg border border-neutral-200 p-4 ${stat.bg}`}
					>
						<div className="flex items-center justify-between">
							<span className="text-sm text-neutral-600">
								{stat.label}
							</span>
							{stat.icon}
						</div>
						<div className="mt-2 text-2xl font-semibold text-neutral-900">
							{stat.value}
						</div>
					</div>
				))}
			</section>

			{/* Main content */}
			<section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Active Incidents */}
				<div className="lg:col-span-2 rounded-lg border border-neutral-200 bg-white">
					<div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
						<h2 className="text-sm font-semibold text-neutral-900">
							Active Incidents
						</h2>
						<Link
							href={`/app/${tenantId}/incidents`}
							className="text-sm font-medium text-neutral-700 hover:text-neutral-900"
						>
							View all
						</Link>
					</div>

					<ul className="divide-y divide-neutral-200">
						{activeIncidents.map((incident) => (
							<li
								key={incident.id}
								className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50"
							>
								<div>
									<p className="text-sm font-medium text-neutral-900">
										{incident.title}
									</p>
									<p className="text-xs text-neutral-500">
										{incident.status} • Updated{" "}
										{incident.updatedAt}
									</p>
								</div>

								<span
									className={`rounded-full px-3 py-1 text-xs font-medium ${
										incident.severity === "Critical"
											? "bg-red-100 text-red-700"
											: incident.severity === "High"
												? "bg-orange-100 text-orange-700"
												: "bg-yellow-100 text-yellow-700"
									}`}
								>
									{incident.severity}
								</span>
							</li>
						))}
					</ul>
				</div>

				{/* Recent Alerts */}
				<div className="rounded-lg border border-neutral-200 bg-white">
					<div className="border-b border-neutral-200 px-4 py-3">
						<h2 className="text-sm font-semibold text-neutral-900">
							Recent Alerts
						</h2>
					</div>

					<ul className="divide-y divide-neutral-200">
						{recentAlerts.map((alert) => (
							<li
								key={alert.id}
								className="px-4 py-3 hover:bg-neutral-50"
							>
								<p className="text-sm text-neutral-800">
									{alert.message}
								</p>
								<p className="text-xs text-neutral-500">
									{alert.time}
								</p>
							</li>
						))}
					</ul>
				</div>
			</section>
		</div>
	);
};

export default DashboardPage;
