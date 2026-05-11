"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { incidentApi } from "@/lib/api/incidentApi";

export default function IntegrationDetailPage() {
	const { id } = useParams();
	const [integration, setIntegration] = useState<any>(null);

	useEffect(() => {
		const fetchIntegration = async () => {
			const res = await incidentApi.get(`/integrations/${id}`);
			setIntegration(res.data);
		};

		fetchIntegration();
	}, []);

	if (!integration) return <p>Loading...</p>;

	return (
		<div className="space-y-6">
			<h1 className="text-xl font-semibold">{integration.name}</h1>

			<div className="bg-white p-6 rounded shadow-sm space-y-4">
				<p>Provider: {integration.provider}</p>
				<p>Status: {integration.isActive ? "Active" : "Disabled"}</p>

				<div>
					<h3 className="font-medium">Webhook URL</h3>

					<code className="block bg-gray-100 p-2">
						POST /inc-ser/integrations/webhook
					</code>
				</div>

				<div>
					<h3 className="font-medium">API Key</h3>

					<p className="text-neutral-500">••••••••••••••••</p>
				</div>
			</div>
		</div>
	);
}
