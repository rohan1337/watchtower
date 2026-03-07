"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { incidentApi } from "@/lib/api/incidentApi";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";
import { useRouter } from "next/navigation";
import { Plug, Plus } from "lucide-react";
import TableContainer from "@/components/tables/TableContainer";
import TableHeader from "@/components/tables/TableHeader";

type Integration = {
	id: string;
	name: string;
	provider: string;
	isActive: boolean;
	keys: {
		id: string;
		isPrimary: boolean;
		expiresAt: string | null;
	}[];
};

export default function IntegrationsPage() {
	const [integrations, setIntegrations] = useState<Integration[]>([]);
	const [loading, setLoading] = useState(true);

	const { slug } = useParams();
	const router = useRouter();

	const fetchIntegrations = async () => {
		try {
			const res = await incidentApi.get("/integrations");
			setIntegrations(res.data);
		} catch {
			toast.error("Failed to load integrations");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchIntegrations();
	}, []);

	const rotateKey = async (id: string) => {
		try {
			const res = await incidentApi.patch(
				`/integrations/${id}/rotate-key`,
			);

			toast.success("New API key generated");

			// Show key once
			alert(`New API Key:\n\n${res.data.apiKey}`);

			fetchIntegrations();
		} catch {
			toast.error("Failed to rotate key");
		}
	};

	const toggleIntegration = async (id: string, isActive: boolean) => {
		try {
			await incidentApi.patch(`/integrations/${id}/toggle`, {
				isActive: !isActive,
			});

			fetchIntegrations();
		} catch {
			toast.error("Failed to update integration");
		}
	};

	if (loading) return <p>Loading...</p>;

	return (
		<div className="space-y-6">
			{/* Header */}
			<PageHeader
				icon={<Plug />}
				title="Integrations"
				action={
					<button
						onClick={() => router.push(`/${slug}/integrations/new`)}
						className="flex items-center gap-2 rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-700 cursor-pointer hover:bg-neutral-100"
					>
						<Plus size={16} />
						New Integration
					</button>
				}
			/>

			<TableContainer>
				<thead className="border-b text-left">
					<tr>
						<TableHeader>Name</TableHeader>
						<TableHeader>Provider</TableHeader>
						<TableHeader>Status</TableHeader>
						<TableHeader>API Key</TableHeader>
						<TableHeader align="right">Actions</TableHeader>
					</tr>
				</thead>

				<tbody>
					{integrations.length === 0 ? (
						<tr>
							<td
								colSpan={100}
								className="py-4 text-center text-neutral-500 italic"
							>
								No Integrations Found
							</td>
						</tr>
					) : (
						integrations.map((integration) => {
							const primaryKey = integration.keys.find(
								(k) => k.isPrimary,
							);

							return (
								<tr
									key={integration.id}
									onClick={() =>
										router.push(
											`/${slug}/integrations/${integration.id}`,
										)
									}
									className="border-b cursor-pointer hover:bg-neutral-50"
								>
									<td className="p-4">{integration.name}</td>

									<td>{integration.provider}</td>

									<td>
										<span
											className={`px-2 py-1 rounded-full text-xs ${
												integration.isActive
													? "bg-green-100 text-green-700"
													: "bg-red-100 text-red-700"
											}`}
										>
											{integration.isActive
												? "Active"
												: "Disabled"}
										</span>
									</td>

									<td>
										{primaryKey ? (
											<span className="text-neutral-500">
												••••••••••••••••
											</span>
										) : (
											"No key"
										)}
									</td>

									<td className="space-x-2">
										<button
											onClick={() =>
												rotateKey(integration.id)
											}
											className="text-blue-600 text-xs"
										>
											Rotate
										</button>

										<button
											onClick={() =>
												toggleIntegration(
													integration.id,
													integration.isActive,
												)
											}
											className="text-red-600 text-xs"
										>
											{integration.isActive
												? "Disable"
												: "Enable"}
										</button>
									</td>
								</tr>
							);
						})
					)}
				</tbody>
			</TableContainer>
		</div>
	);
}
