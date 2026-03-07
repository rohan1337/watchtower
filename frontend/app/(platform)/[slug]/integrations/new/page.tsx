"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { incidentApi } from "@/lib/api/incidentApi";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";

export default function CreateIntegrationPage() {
	const router = useRouter();
	const { slug } = useParams();

	const [name, setName] = useState("");
	const [provider, setProvider] = useState("WEBHOOK");

	const createIntegration = async () => {
		try {
			const res = await incidentApi.post("/integrations", {
				name,
				provider,
			});

			const apiKey = res.data.apiKey;

			alert(`Save this API Key:\n\n${apiKey}`);

			router.push(`/${slug}/integrations`);
		} catch {
			toast.error("Failed to create integration");
		}
	};

	return (
		<div className="space-y-6">
			<PageHeader title="Create Integration" />

			<div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
				<input
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Integration name"
					className="border p-2 w-full"
				/>

				<select
					value={provider}
					onChange={(e) => setProvider(e.target.value)}
					className="border p-2 w-full"
				>
					<option value="WEBHOOK">Webhook</option>
					<option value="STRIPE">Stripe</option>
					<option value="GITHUB">Github</option>
					<option value="CUSTOM">Custom</option>
				</select>

				<button
					onClick={createIntegration}
					className="bg-black text-white px-4 py-2 rounded"
				>
					Create Integration
				</button>
			</div>
		</div>
	);
}
