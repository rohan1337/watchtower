"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Filter, ShieldAlert, Clock } from "lucide-react";
import IncidentsSkeleton from "@/components/skeletons/IncidentSkeleton";
import TableHeader from "@/components/tables/TableHeader";
import TableContainer from "@/components/tables/TableContainer";
import PageHeader from "@/components/common/PageHeader";
import { incidentApi } from "@/lib/api/incidentApi";
import { toast } from "sonner";
import { getSocket, initSocket } from "@/lib/socket";

type Incident = {
	id: string;
	title: string;
	severity: string;
	status: string;
	updatedAt: string;
	createdAt: string;
};

type SortKey = keyof Incident;

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

function statusBadge(status: string) {
	switch (status) {
		case "OPEN":
			return "bg-red-50 text-red-700";
		case "INVESTIGATING":
			return "bg-orange-50 text-orange-700";
		case "MONITORING":
			return "bg-blue-50 text-blue-700";
		case "RESOLVED":
			return "bg-green-50 text-green-700";
		default:
			return "bg-neutral-100 text-neutral-700";
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

export default function IncidentsPage() {
	const { slug } = useParams();
	const [incidents, setIncidents] = useState<Incident[]>([]);
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

		// 🔥 If socket not initialized (page refresh case)
		if (!socket) {
			socket = initSocket();
		}

		// Still null → no token yet
		if (!socket) return;

		const handleIncidentEscalated = (data: any) => {
			setIncidents((prev) =>
				prev.map((incident) =>
					incident.id === data.incidentId
						? { ...incident, severity: data.severity }
						: incident,
				),
			);
		};

		socket.on("incident-escalated", handleIncidentEscalated);

		const fetchIncidents = async () => {
			try {
				const res = await incidentApi.get("/incidents");
				setIncidents(res.data);
			} catch (err) {
				toast.error("Failed to fetch incidents");
			} finally {
				setLoading(false);
			}
		};

		fetchIncidents();

		return () => {
			socket?.off("incident-escalated", handleIncidentEscalated);
		};
	}, []);

	const sortedIncidents = [...incidents].sort((a, b) => {
		const valueA = a[sortKey];
		const valueB = b[sortKey];

		if (!valueA || !valueB) return 0;

		if (direction === "asc") {
			return valueA > valueB ? 1 : -1;
		}

		return valueA < valueB ? 1 : -1;
	});

	if (loading) return <IncidentsSkeleton />;

	return (
		<div className="space-y-6">
			{/* Header */}
			<PageHeader
				icon={<ShieldAlert />}
				title="Incidents"
				action={
					<button className="flex items-center gap-2 rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-700 cursor-pointer hover:bg-neutral-100">
						<Filter size={16} />
						Filters
					</button>
				}
			/>

			{/* Table */}
			<TableContainer>
				<thead className="bg-neutral-50">
					<tr>
						<TableHeader>Incident</TableHeader>
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
							sortKey="status"
							activeSortKey={sortKey}
							direction={direction}
							onSort={handleSort}
						>
							Status
						</TableHeader>
						<TableHeader
							sortable
							sortKey="createdAt"
							activeSortKey={sortKey}
							direction={direction}
							onSort={handleSort}
						>
							Created
						</TableHeader>
						<TableHeader
							sortable
							sortKey="updatedAt"
							activeSortKey={sortKey}
							direction={direction}
							onSort={handleSort}
						>
							Last Updated
						</TableHeader>
					</tr>
				</thead>

				<tbody className="divide-y divide-neutral-200">
					{sortedIncidents.length === 0 ? (
						<tr>
							<td
								colSpan={100}
								className="py-4 text-center text-neutral-500 italic"
							>
								No Incidents Found
							</td>
						</tr>
					) : (
						sortedIncidents.map((incident) => (
							<tr
								key={incident.id}
								className="hover:bg-neutral-50"
							>
								<td className="px-4 py-3">
									<Link
										href={`/${slug}/incidents/${incident.id}`}
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
									{new Date(
										incident.createdAt,
									).toLocaleTimeString()}
								</td>

								<td className="px-4 py-3 text-sm text-neutral-700">
									<div className="flex items-center gap-1">
										<Clock size={14} />
										{timeAgo(incident.updatedAt)}
									</div>
								</td>
							</tr>
						))
					)}
				</tbody>
			</TableContainer>
		</div>
	);
}
