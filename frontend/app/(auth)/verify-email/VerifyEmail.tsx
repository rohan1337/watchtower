"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const BASE_URL_AUTH_SER = process.env.NEXT_PUBLIC_API_BASE_URL_AUTH_SER;

export default function VerifyEmail() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const params = useSearchParams();
	const token = params.get("token");
	const router = useRouter();

	useEffect(() => {
		if (!token) {
			setLoading(false);
			setError("Invalid verification link.");
			return;
		}

		const verify = async () => {
			try {
				const res = await fetch(
					`${BASE_URL_AUTH_SER}/api/auth/verify-email`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						credentials: "include",
						body: JSON.stringify({ token }),
					},
				);

				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.message || "Verification failed");
				}

				toast.success("Email verified!");
				localStorage.removeItem("pending_email");
				router.push("/onboarding");
			} catch (err: any) {
				setError(err.message || "Verification failed");
				toast.error(err.message || "Verification failed");
			} finally {
				setLoading(false);
			}
		};

		verify();
	}, [token, router]);

	if (loading) {
		return (
			<div className="h-screen bg-neutral-100 flex items-center justify-center">
				<p className="text-neutral-900">Verifying email…</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="h-screen bg-neutral-100 flex items-center justify-center">
				<p className="text-red-600">{error}</p>
			</div>
		);
	}

	return null;
}
