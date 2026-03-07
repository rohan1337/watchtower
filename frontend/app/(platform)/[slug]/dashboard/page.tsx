"use client";

import { useEffect, useState } from "react";
import { useTenant } from "@/app/contexts/tenant-context/TenantContext";
import DashboardSection from "@/components/dashboard/DashboardSection";
import KPICard from "@/components/dashboard/KPICard";
import SeverityCard from "@/components/dashboard/SeverityCard";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { incidentApi } from "@/lib/api/incidentApi";
import { toast } from "sonner";
import { getSocket, initSocket } from "@/lib/socket";

type DashboardData = {
	stats: {
		activeIncidents: number;
		resolvedToday: number;
	};
	alertCount: number;
	severityBreakdown: Record<string, number>;
	recentIncidents: any[]; // replace with proper type later
};

function getSeverityColor(severity: string) {
	const map: Record<string, string> = {
		CRITICAL: "text-red-600",
		HIGH: "text-orange-600",
		MEDIUM: "text-yellow-600",
		LOW: "text-green-600",
	};

	return map[severity] || "text-gray-600";
}

function formatTimeAgo(dateString: string) {
	const date = new Date(dateString);
	const now = new Date();
	const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diff < 60) return `${diff}s ago`;
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

	return date.toLocaleDateString();
}

export default function DashboardPage() {
	const { tenant } = useTenant();
	const [data, setData] = useState<DashboardData>({
		stats: { activeIncidents: 0, resolvedToday: 0 },
		alertCount: 0,
		severityBreakdown: {},
		recentIncidents: [],
	});
	const [loading, setLoading] = useState(true);

	const kpis = [
		{
			title: "Active Incidents",
			value: data.stats.activeIncidents,
			color: "bg-red-400",
		},
		{
			title: "Open Alerts",
			value: data.alertCount,
			color: "bg-yellow-400",
		},
		{
			title: "Resolved Today",
			value: data.stats.resolvedToday,
			color: "bg-green-400",
		},
		{
			title: "Integrations",
			value: 4,
			color: "bg-blue-400",
		},
	];

	const severityConfig: Record<
		string,
		{ label: string; color: "red" | "orange" | "yellow" | "green" | "gray" }
	> = {
		CRITICAL: { label: "Critical", color: "red" },
		HIGH: { label: "High", color: "orange" },
		MEDIUM: { label: "Medium", color: "yellow" },
		LOW: { label: "Low", color: "green" },
	};

	useEffect(() => {
		const ensureSocket = () => {
			let socket = getSocket();

			// 🔥 If socket not initialized (page refresh case)
			if (!socket) {
				socket = initSocket();
			}

			return socket;
		};

		const socket = ensureSocket();
		if (!socket) return;

		const refreshDashboard = async () => {
			try {
				const res = await incidentApi.get("/incidents/dashboard");
				setData(res.data);
			} catch (err) {
				console.error("Failed to refresh dashboard", err);
			}
		};

		socket.on("alert-created", refreshDashboard);
		socket.on("incident-escalated", refreshDashboard);

		const fetchDashboard = async () => {
			try {
				const res = await incidentApi.get("/incidents/dashboard");
				setData(res.data);
			} catch (err) {
				toast.error("Failed to fetch dashboard data");
			} finally {
				setLoading(false);
			}
		};

		fetchDashboard();

		return () => {
			socket.off("alert-created", refreshDashboard);
			socket.off("incident-escalated", refreshDashboard);
		};
	}, []);

	if (loading) return <DashboardSkeleton />;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-semibold text-neutral-900">
					Welcome to {tenant.name}
				</h1>
				<p className="text-neutral-600 mt-1">
					Overview of your incident and alert activity
				</p>
			</div>

			{/* KPI Sections */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				{kpis.map((kpi) => (
					<KPICard
						key={kpi.title}
						title={kpi.title}
						value={kpi.value}
						color={kpi.color}
					/>
				))}
			</div>

			{/* Severity Section */}
			<DashboardSection title="Incident Severity Breakdown">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{Object.entries(data.severityBreakdown).map(
						([key, count]) => {
							const config = severityConfig[key] || {
								label: key,
								color: "gray" as const,
							};

							return (
								<SeverityCard
									key={key}
									label={config.label}
									count={count}
									color={config.color}
								/>
							);
						},
					)}
				</div>
			</DashboardSection>

			{/* Recent Incidents Section */}
			<DashboardSection title="Recent Incidents">
				<table className="w-full text-sm">
					<thead className="text-left text-neutral-700 border-b">
						<tr>
							<th className="py-2">Title</th>
							<th className="py-2">Severity</th>
							<th className="py-2">Status</th>
							<th className="py-2">Assigned</th>
							<th className="py-2">Created</th>
						</tr>
					</thead>

					<tbody className="text-left text-neutral-700">
						{data.recentIncidents.length === 0 ? (
							<tr>
								<td
									colSpan={100}
									className="py-4 text-center text-neutral-500 italic"
								>
									No Incidents Found
								</td>
							</tr>
						) : (
							data.recentIncidents.map((incident: any) => (
								<tr key={incident.id} className="border-b">
									<td className="py-3">{incident.title}</td>

									<td
										className={getSeverityColor(
											incident.severity,
										)}
									>
										{incident.severity}
									</td>

									<td>{incident.status}</td>

									<td>
										{incident.createdBy?.name ||
											"Unassigned"}
									</td>

									<td>{formatTimeAgo(incident.createdAt)}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</DashboardSection>
		</div>
	);
}
