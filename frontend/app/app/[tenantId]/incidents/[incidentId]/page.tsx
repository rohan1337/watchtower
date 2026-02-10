"use client";

import { useParams } from "next/navigation";
import { ShieldAlert, AlertTriangle, Activity, Clock } from "lucide-react";

const incident = {
	id: "inc-101",
	title: "Payment gateway latency",
	severity: "Critical",
	status: "Investigating",
	createdAt: "Today at 10:12 AM",
	description:
		"Users are experiencing increased latency and intermittent failures while processing payments.",
};

const timeline = [
	{
		time: "10:12 AM",
		title: "Incident detected",
		description: "Monitoring system detected high latency.",
		type: "alert",
	},
	{
		time: "10:15 AM",
		title: "Incident acknowledged",
		description: "On-call engineer acknowledged the incident.",
		type: "status",
	},
	{
		time: "10:21 AM",
		title: "Root cause investigation started",
		description: "Payment provider API response times elevated.",
		type: "update",
	},
];

function severityStyle(severity: string) {
	switch (severity) {
		case "Critical":
			return "bg-red-100 text-red-700";
		case "High":
			return "bg-orange-100 text-orange-700";
		case "Medium":
			return "bg-yellow-100 text-yellow-700";
		default:
			return "bg-neutral-200 text-neutral-700";
	}
}

function statusStyle(status: string) {
	switch (status) {
		case "Investigating":
			return "bg-red-50 text-red-700";
		case "Identified":
			return "bg-orange-50 text-orange-700";
		case "Monitoring":
			return "bg-blue-50 text-blue-700";
		case "Resolved":
			return "bg-green-50 text-green-700";
		default:
			return "bg-neutral-100 text-neutral-700";
	}
}

const IncidentDetailPage = () => {
	const params = useParams();
	const incidentId = params?.incidentId as string;

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="space-y-2">
				<div className="flex items-center gap-3">
					<ShieldAlert className="text-neutral-700" />
					<h1 className="text-xl font-semibold text-neutral-900">
						{incident.title}
					</h1>
				</div>

				<div className="flex flex-wrap items-center gap-3 text-sm">
					<span className="text-neutral-500">{incidentId}</span>

					<span
						className={`rounded-full px-3 py-1 text-xs font-medium ${severityStyle(
							incident.severity,
						)}`}
					>
						{incident.severity}
					</span>

					<span
						className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle(
							incident.status,
						)}`}
					>
						{incident.status}
					</span>

					<span className="flex items-center gap-1 text-neutral-500">
						<Clock size={14} />
						Created {incident.createdAt}
					</span>
				</div>
			</div>

			{/* Description */}
			<div className="rounded-lg border border-neutral-200 bg-white p-4">
				<h2 className="mb-2 text-sm font-semibold text-neutral-900">
					Description
				</h2>
				<p className="text-sm text-neutral-700">
					{incident.description}
				</p>
			</div>

			{/* Main Content */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Timeline */}
				<div className="lg:col-span-2 rounded-lg border border-neutral-200 bg-white">
					<div className="border-b border-neutral-200 px-4 py-3">
						<h2 className="text-sm font-semibold text-neutral-900">
							Incident Timeline
						</h2>
					</div>

					<ul className="divide-y divide-neutral-200">
						{timeline.map((event, index) => (
							<li key={index} className="flex gap-4 px-4 py-4">
								<div className="mt-1">
									{event.type === "alert" && (
										<AlertTriangle
											className="text-red-600"
											size={18}
										/>
									)}
									{event.type === "status" && (
										<Activity
											className="text-blue-600"
											size={18}
										/>
									)}
									{event.type === "update" && (
										<Activity
											className="text-neutral-600"
											size={18}
										/>
									)}
								</div>

								<div className="flex-1">
									<div className="flex items-center justify-between">
										<p className="text-sm font-medium text-neutral-900">
											{event.title}
										</p>
										<span className="text-xs text-neutral-500">
											{event.time}
										</span>
									</div>
									<p className="mt-1 text-sm text-neutral-700">
										{event.description}
									</p>
								</div>
							</li>
						))}
					</ul>
				</div>

				{/* Side Panel */}
				<div className="space-y-4">
					{/* Status Actions */}
					<div className="rounded-lg border border-neutral-200 bg-white p-4">
						<h3 className="mb-3 text-sm font-semibold text-neutral-900">
							Update Status
						</h3>

						<div className="space-y-2">
							<button className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-100">
								Mark as Identified
							</button>
							<button className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-100">
								Mark as Monitoring
							</button>
							<button className="w-full rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700">
								Resolve Incident
							</button>
						</div>
					</div>

					{/* Metadata */}
					<div className="rounded-lg border border-neutral-200 bg-white p-4">
						<h3 className="mb-3 text-sm font-semibold text-neutral-900">
							Incident Metadata
						</h3>

						<ul className="space-y-2 text-sm text-neutral-700">
							<li>
								<span className="text-neutral-500">
									Severity:
								</span>{" "}
								{incident.severity}
							</li>
							<li>
								<span className="text-neutral-500">
									Status:
								</span>{" "}
								{incident.status}
							</li>
							<li>
								<span className="text-neutral-500">Owner:</span>{" "}
								Unassigned
							</li>
							<li>
								<span className="text-neutral-500">Source</span>
								: Monitoring
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

export default IncidentDetailPage;
