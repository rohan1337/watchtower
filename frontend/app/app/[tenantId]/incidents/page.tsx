"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Filter, ShieldAlert, Clock } from "lucide-react";

type Incident = {
	id: string;
	title: string;
	severity: "Critical" | "High" | "Medium" | "Low";
	status: "Investigating" | "Identified" | "Monitoring" | "Resolved";
	updatedAt: string;
	createdAt: string;
};

const incidents: Incident[] = [
	{
		id: "inc-101",
		title: "Payment gateway latency",
		severity: "Critical",
		status: "Investigating",
		createdAt: "10:12 AM",
		updatedAt: "2 min ago",
	},
	{
		id: "inc-102",
		title: "Webhook delivery failures",
		severity: "High",
		status: "Identified",
		createdAt: "09:44 AM",
		updatedAt: "18 min ago",
	},
	{
		id: "inc-103",
		title: "Email notifications delayed",
		severity: "Medium",
		status: "Monitoring",
		createdAt: "09:10 AM",
		updatedAt: "35 min ago",
	},
	{
		id: "inc-104",
		title: "Search indexing backlog",
		severity: "Low",
		status: "Resolved",
		createdAt: "Yesterday",
		updatedAt: "1h ago",
	},
];

function severityBadge(severity: Incident["severity"]) {
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

function statusBadge(status: Incident["status"]) {
	switch (status) {
		case "Investigating":
			return "bg-red-50 text-red-700";
		case "Identified":
			return "bg-orange-50 text-orange-700";
		case "Monitoring":
			return "bg-blue-50 text-blue-700";
		case "Resolved":
			return "bg-green-50 text-green-700";
	}
}

const IncidentsPage = () => {
	const params = useParams();
	const tenantId = params?.tenantId as string;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<ShieldAlert className="text-neutral-700" />
					<h1 className="text-lg font-semibold text-neutral-900">
						Incidents
					</h1>
				</div>

				<button className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100">
					<Filter size={16} />
					Filters
				</button>
			</div>

			{/* Table */}
			<div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
				<table className="min-w-full divide-y divide-neutral-200">
					<thead className="bg-neutral-50">
						<tr>
							<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-600">
								Incident
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-600">
								Severity
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-600">
								Status
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-600">
								Created
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-600">
								Last Updated
							</th>
						</tr>
					</thead>

					<tbody className="divide-y divide-neutral-200">
						{incidents.map((incident) => (
							<tr
								key={incident.id}
								className="hover:bg-neutral-50"
							>
								<td className="px-4 py-3">
									<Link
										href={`/app/${tenantId}/incidents/${incident.id}`}
										className="block"
									>
										<p className="text-sm font-medium text-neutral-900">
											{incident.title}
										</p>
										<p className="text-xs text-neutral-500">
											{incident.id}
										</p>
									</Link>
								</td>

								<td className="px-4 py-3">
									<span
										className={`rounded-full px-3 py-1 text-xs font-medium ${severityBadge(
											incident.severity,
										)}`}
									>
										{incident.severity}
									</span>
								</td>

								<td className="px-4 py-3">
									<span
										className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge(
											incident.status,
										)}`}
									>
										{incident.status}
									</span>
								</td>

								<td className="px-4 py-3 text-sm text-neutral-700">
									{incident.createdAt}
								</td>

								<td className="px-4 py-3 text-sm text-neutral-700">
									<div className="flex items-center gap-1">
										<Clock size={14} />
										{incident.updatedAt}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default IncidentsPage;
