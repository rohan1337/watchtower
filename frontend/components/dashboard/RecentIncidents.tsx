import DashboardSection from "./DashboardSection";

export default function RecentIncidentsTable() {
	return (
		<DashboardSection title="Recent Incidents">
			<table className="w-full text-sm">
				<thead className="text-left text-neutral-700 border-b">
					<tr>
						<th className="py-2">Title</th>
						<th>Severity</th>
						<th>Status</th>
						<th>Assigned</th>
						<th>Created</th>
					</tr>
				</thead>
				<tbody className="text-left text-neutral-700 border-b">
					<tr className="border-b">
						<td className="py-3">Database outage</td>
						<td className="text-red-600">Critical</td>
						<td>Investigating</td>
						<td>Rohan</td>
						<td>10 mins ago</td>
					</tr>
					<tr>
						<td className="py-3">API latency spike</td>
						<td className="text-orange-600">High</td>
						<td>Resolved</td>
						<td>DevOps Team</td>
						<td>1 hour ago</td>
					</tr>
				</tbody>
			</table>
		</DashboardSection>
	);
}
