"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ShieldAlert, AlertTriangle, Activity, Clock } from "lucide-react";

const BASE_URL_INC_SER = process.env.NEXT_PUBLIC_API_BASE_URL_INC_SER;

export default function IncidentDetailPage() {
	const { incidentId } = useParams();
	const [incident, setIncident] = useState<any>(null);

	useEffect(() => {
		const fetchIncident = async () => {
			const res = await fetch(
				`${BASE_URL_INC_SER}/incidents/${incidentId}`,
				{ credentials: "include" },
			);

			if (!res.ok) return;

			const data = await res.json();
			setIncident(data);
		};

		if (incidentId) fetchIncident();
	}, [incidentId]);

	if (!incident) return <div>Loading...</div>;

	return (
		<div>
			<h1>{incident.title}</h1>
			<p>{incident.description}</p>
		</div>
	);
}
