"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Filter, Clock, ShieldAlert } from "lucide-react";

type Alert = {
	id: string;
	message: string;
	severity: "Critical" | "High" | "Medium" | "Low";
	source: string;
	time: string;
	incidentId?: string;
};

const alerts: Alert[] = [
	{
		id: "al-201",
		message: "CPU usage > 90% on worker-3",
		severity: "Critical",
		source: "System Monitor",
		time: "2 min ago",
		incidentId: "inc-101",
	},
	{
		id: "al-202",
		message: "Redis connection retries detected",
		severity: "High",
		source: "Cache Monitor",
		time: "12 min ago",
		incidentId: "inc-102",
	},
	{
		id: "al-203",
		message: "5xx error rate increased",
		severity: "Medium",
		source: "API Gateway",
		time: "26 min ago",
	},
	{
		id: "al-204",
		message: "Background job queue delay",
		severity: "Low",
		source: "Worker Queue",
		time: "1h ago",
	},
];

function severityBadge(severity: Alert["severity"]) {
	switch (severity) {
		case "Critical":
			return "bg-red-100 text-red-700";
		case "High":
			return "bg-orange-100 text-orange-700";
		case "Medium":
			return "bg-yellow-100 text-yellow-700";
		case "Low":
			return "bg-neutral-200 text-neutral-700";
	}
}

const AlertsPage = () => {
	const params = useParams();
	const tenantId = params?.tenantId as string;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<AlertTriangle className="text-neutral-700" />
					<h1 className="text-lg font-semibold text-neutral-900">
						Alerts
					</h1>
				</div>

				<button className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100">
					<Filter size={16} />
					Filters
				</button>
			</div>

			{/* Alerts Table */}
			<div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
				<table className="min-w-full divide-y divide-neutral-200">
					<thead className="bg-neutral-50">
						<tr>
							<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-600">
								Alert
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-600">
								Severity
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-600">
								Source
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-600">
								Time
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-600">
								Incident
							</th>
						</tr>
					</thead>

					<tbody className="divide-y divide-neutral-200">
						{alerts.map((alert) => (
							<tr key={alert.id} className="hover:bg-neutral-50">
								<td className="px-4 py-3">
									<p className="text-sm font-medium text-neutral-900">
										{alert.message}
									</p>
									<p className="text-xs text-neutral-500">
										{alert.id}
									</p>
								</td>

								<td className="px-4 py-3">
									<span
										className={`rounded-full px-3 py-1 text-xs font-medium ${severityBadge(
											alert.severity,
										)}`}
									>
										{alert.severity}
									</span>
								</td>

								<td className="px-4 py-3 text-sm text-neutral-700">
									{alert.source}
								</td>

								<td className="px-4 py-3 text-sm text-neutral-700">
									<div className="flex items-center gap-1">
										<Clock size={14} />
										{alert.time}
									</div>
								</td>

								<td className="px-4 py-3">
									{alert.incidentId ? (
										<Link
											href={`/app/${tenantId}/incidents/${alert.incidentId}`}
											className="inline-flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-neutral-900"
										>
											<ShieldAlert size={14} />
											{alert.incidentId}
										</Link>
									) : (
										<span className="text-sm text-neutral-400">
											—
										</span>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default AlertsPage;
