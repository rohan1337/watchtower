"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, Filter, Clock, ShieldAlert } from "lucide-react";
import AlertsSkeleton from "@/components/skeletons/AlertSkeleton";
import Link from "next/link";
import PageHeader from "@/components/common/PageHeader";
import TableContainer from "@/components/tables/TableContainer";
import TableHeader from "@/components/tables/TableHeader";
import { incidentApi } from "@/lib/api/incidentApi";
import { toast } from "sonner";
import { getSocket, initSocket } from "@/lib/socket";

type Alert = {
	id: string;
	message: string;
	severity: string;
	status: string;
	source?: string;
	incidentId: string;
	createdAt: string;
};

type SortKey = keyof Alert;

function severityBadge(severity: string) {
	switch (severity) {
		case "CRITICAL":
			return "bg-red-100 text-red-700";
		case "HIGH":
			return "bg-orange-100 text-orange-700";
		case "MEDIUM":
			return "bg-yellow-100 text-yellow-700";
		case "LOW":
			return "bg-neutral-200 text-neutral-700";
		default:
			return "bg-neutral-200 text-neutral-700";
	}
}

function timeAgo(dateString: string) {
	const now = new Date();
	const date = new Date(dateString);
	const diff = Math.floor((now.getTime() - date.getTime()) / 60000);

	if (diff < 1) return "just now";
	if (diff < 60) return `${diff} min ago`;

	const hours = Math.floor(diff / 60);
	if (hours < 24) return `${hours}h ago`;

	const days = Math.floor(hours / 24);
	return `${days}d ago`;
}

const AlertsPage = () => {
	const { slug } = useParams();
	const [alerts, setAlerts] = useState<Alert[]>([]);
	const [loading, setLoading] = useState(true);
	const [sortKey, setSortKey] = useState<SortKey>("createdAt");
	const [direction, setDirection] = useState<"asc" | "desc">("desc");

	const handleSort = (key: SortKey) => {
		if (sortKey === key) {
			setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
		} else {
			setSortKey(key);
			setDirection("asc");
		}
	};

	useEffect(() => {
		let socket = getSocket();

		// 🔥 If user refreshed page, socket may not exist
		if (!socket) {
			socket = initSocket();
		}

		// Still null? Probably token not ready yet.
		if (!socket) return;

		const alertBuffer: Alert[] = [];
		let flushTimeout: NodeJS.Timeout | null = null;
		const tenantSlug = Array.isArray(slug) ? slug[0] : slug;

		const handleAlertCreated = (data: any) => {
			if (!tenantSlug || data.tenantId !== tenantSlug) return;

			alertBuffer.push(data.alert);

			if (!flushTimeout) {
				flushTimeout = setTimeout(() => {
					setAlerts((prev) => {
						const newAlerts = alertBuffer.filter(
							(a) => !prev.some((p) => p.id === a.id),
						);
						alertBuffer.length = 0;
						flushTimeout = null;
						return [...newAlerts, ...prev];
					});
				}, 100); // batch window
			}
		};

		const handleIncidentEscalated = (data: any) => {
			if (!tenantSlug || data.tenantId !== tenantSlug) return;

			setAlerts((prev) =>
				prev.map((alert) =>
					alert.incidentId === data.incidentId
						? { ...alert, severity: data.severity }
						: alert,
				),
			);
		};

		socket.on("alert-created", handleAlertCreated);
		socket.on("incident-escalated", handleIncidentEscalated);

		const fetchAlerts = async () => {
			try {
				const res = await incidentApi.get("/alerts");
				setAlerts(res.data);
			} catch (err) {
				toast.error("Failed to fetch alerts");
			} finally {
				setLoading(false);
			}
		};

		fetchAlerts();

		return () => {
			socket?.off("alert-created", handleAlertCreated);
			socket?.off("incident-escalated", handleIncidentEscalated);
		};
	}, [slug]);

	const sortedAlerts = [...alerts].sort((a, b) => {
		const valueA = a[sortKey];
		const valueB = b[sortKey];

		if (!valueA || !valueB) return 0;

		// convert time strings if sorting by "time"
		if (sortKey === "createdAt") {
			const valA = new Date(valueA as string).getTime();
			const valB = new Date(valueB as string).getTime();
			return direction === "asc" ? valA - valB : valB - valA;
		}

		// default sorting
		if (direction === "asc") {
			return valueA > valueB ? 1 : -1;
		}
		return valueA < valueB ? 1 : -1;
	});

	if (loading) return <AlertsSkeleton />;

	return (
		<div className="space-y-6">
			{/* Header */}
			<PageHeader
				icon={<AlertTriangle />}
				title="Alerts"
				action={
					<button className="flex items-center gap-2 rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-700 cursor-pointer hover:bg-neutral-100">
						<Filter size={16} />
						Filters
					</button>
				}
			/>

			{/* Alerts Table */}
			<TableContainer>
				<thead className="bg-neutral-50">
					<tr>
						<TableHeader>Alert</TableHeader>
						<TableHeader
							sortable
							sortKey="severity"
							activeSortKey={sortKey}
							direction={direction}
							onSort={handleSort}
						>
							Severity
						</TableHeader>
						<TableHeader
							sortable
							sortKey="source"
							activeSortKey={sortKey}
							direction={direction}
							onSort={handleSort}
						>
							Source
						</TableHeader>
						<TableHeader
							sortable
							sortKey="createdAt"
							activeSortKey={sortKey}
							direction={direction}
							onSort={handleSort}
						>
							Time
						</TableHeader>
						<TableHeader>Incident</TableHeader>
					</tr>
				</thead>

				<tbody className="divide-y divide-neutral-200">
					{sortedAlerts.length === 0 ? (
						<tr>
							<td
								colSpan={100}
								className="py-4 text-center text-neutral-500 italic"
							>
								No Alerts Found
							</td>
						</tr>
					) : (
						sortedAlerts.map((alert) => (
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
										{timeAgo(alert.createdAt)}
									</div>
								</td>

								<td className="px-4 py-3">
									{alert.incidentId ? (
										<Link
											href={`/${slug}/incidents/${alert.incidentId}`}
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
						))
					)}
				</tbody>
			</TableContainer>
		</div>
	);
};

export default AlertsPage;
