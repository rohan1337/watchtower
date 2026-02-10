"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const BASE_URL_AUTH_SER = process.env.NEXT_PUBLIC_API_BASE_URL_AUTH_SER;

export default function VerifyEmailPage() {
	const params = useSearchParams();
	const token = params.get("token");
	const router = useRouter();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!token) {
			setLoading(false);
			return;
		}

		const verify = async () => {
			try {
				const res = await fetch(
					`${BASE_URL_AUTH_SER}/auth/verify-email`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ token }),
					},
				);

				if (!res.ok) {
					const data = await res.json();
					throw new Error(data.message);
				}

				toast.success("Email verified! Please log in.");
				router.push("/login");
			} catch (err: any) {
				toast.error(err.message || "Verification failed");
			} finally {
				setLoading(false);
			}
		};

		verify();
	}, [token]);

	if (loading) {
		return (
			<div className="h-screen flex items-center justify-center">
				<p className="text-neutral-700">Verifying email…</p>
			</div>
		);
	}

	if (!token) {
		return (
			<div className="h-screen flex items-center justify-center">
				<p className="text-red-600">Invalid verification link.</p>
			</div>
		);
	}

	return null;
}
