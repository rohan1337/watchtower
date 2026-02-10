"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, ShieldAlert, Clock } from "lucide-react";

type Notification = {
	id: string;
	message: string;
	severity: "Critical" | "High" | "Medium";
	time: string;
	incidentId?: string;
};

const notifications: Notification[] = [
	{
		id: "nt-1",
		message: "Payment gateway latency detected",
		severity: "Critical",
		time: "2 min ago",
		incidentId: "inc-101",
	},
	{
		id: "nt-2",
		message: "Redis connection retries increased",
		severity: "High",
		time: "12 min ago",
		incidentId: "inc-102",
	},
	{
		id: "nt-3",
		message: "API error rate elevated",
		severity: "Medium",
		time: "28 min ago",
	},
];

function severityIcon(severity: Notification["severity"]) {
	switch (severity) {
		case "Critical":
			return <AlertTriangle className="text-red-600" size={16} />;
		case "High":
			return <AlertTriangle className="text-orange-600" size={16} />;
		case "Medium":
			return <AlertTriangle className="text-yellow-600" size={16} />;
	}
}

const NotificationDropdown = () => {
	const params = useParams();
	const tenantId = params?.tenantId as string;

	return (
		<div className="absolute right-0 mt-2 w-96 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
				<span className="text-sm font-semibold text-neutral-900">
					Notifications
				</span>
				<Link
					href={`/app/${tenantId}/alerts`}
					className="text-sm font-medium text-neutral-700 hover:text-neutral-900"
				>
					View all
				</Link>
			</div>

			{/* List */}
			<ul className="max-h-96 divide-y divide-neutral-200 overflow-y-auto">
				{notifications.map((n) => (
					<li
						key={n.id}
						className="flex gap-3 px-4 py-3 hover:bg-neutral-50"
					>
						<div className="mt-1">{severityIcon(n.severity)}</div>

						<div className="flex-1">
							<p className="text-sm font-medium text-neutral-900">
								{n.message}
							</p>

							<div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
								<span className="flex items-center gap-1">
									<Clock size={12} />
									{n.time}
								</span>

								{n.incidentId && (
									<Link
										href={`/app/${tenantId}/incidents/${n.incidentId}`}
										className="inline-flex items-center gap-1 font-medium text-neutral-700 hover:text-neutral-900"
									>
										<ShieldAlert size={12} />
										{n.incidentId}
									</Link>
								)}
							</div>
						</div>
					</li>
				))}
			</ul>

			{/* Footer */}
			<div className="border-t border-neutral-200 px-4 py-2 text-center">
				<button className="text-sm font-medium text-neutral-700 hover:text-neutral-900">
					Mark all as read
				</button>
			</div>
		</div>
	);
};

export default NotificationDropdown;
