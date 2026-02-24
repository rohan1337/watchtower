"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import AuthSelect from "@/components/auth/AuthSelect";
import AuthError from "@/components/auth/AuthError";
import AuthButton from "@/components/auth/AuthButton";

const BASE_URL_AUTH_SER = process.env.NEXT_PUBLIC_API_BASE_URL_AUTH_SER;

const CreateWorkspacePage = () => {
	const [workspaceName, setWorkspaceName] = useState("");
	const [teamSize, setTeamSize] = useState("");
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<string[]>([]);

	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setErrors([]);

		if (!workspaceName.trim()) {
			setErrors(["Workspace name is required"]);
			setLoading(false);
			return;
		}

		try {
			const res = await fetch(`${BASE_URL_AUTH_SER}/tenants`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include", // important if using httpOnly cookies
				body: JSON.stringify({
					name: workspaceName,
					teamSize,
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(JSON.stringify(data));
			}

			// Assuming backend returns created tenant
			const { id: tenantId, slug } = data.tenant;

			// Call select-workspace to issue scoped JWT
			const selectRes = await fetch(
				`${BASE_URL_AUTH_SER}/auth/select-workspace`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ tenantId }),
				},
			);

			if (!selectRes.ok) {
				throw new Error("Failed to activate workspace session");
			}

			toast.success("Workspace created successfully!");

			// Redirect with context
			router.replace(`/${slug}/dashboard`);
		} catch (err: any) {
			try {
				const parsed = JSON.parse(err.message);

				if (parsed.errors && parsed.errors.length > 0) {
					const firstError = parsed.errors[0];
					const firstMessage = firstError.errors[0];
					setErrors([firstMessage]);
				} else {
					setErrors(["Failed to create workspace"]);
				}
			} catch {
				setErrors([err.message || "Unexpected error"]);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthLayout
			title="Create Your Workspace"
			subtitle="This will be your team's command center in Watchtower"
		>
			<form className="space-y-4" onSubmit={handleSubmit}>
				<AuthInput
					label="Workspace Name"
					name="workspaceName"
					value={workspaceName}
					placeholder="Enter your organization name"
					required
					onChange={(e) => setWorkspaceName(e.target.value)}
				/>

				<AuthSelect
					label="Team Size"
					name="teamSize"
					value={teamSize}
					onChange={(e) => setTeamSize(e.target.value)}
					options={[
						{ value: "1-10", label: "1-10" },
						{ value: "10-50", label: "10-50" },
						{ value: "50-200", label: "50-200" },
						{ value: "200+", label: "200+" },
					]}
				/>

				<AuthError messages={errors} />

				<AuthButton
					loading={loading}
					text="Create Workspace"
					loadingText="Creating Workspace..."
				/>
			</form>
		</AuthLayout>
	);
};

export default CreateWorkspacePage;
