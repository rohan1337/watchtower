"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const BASE_URL_AUTH_SER = process.env.NEXT_PUBLIC_API_BASE_URL_AUTH_SER;

export default function OnboardingPage() {
	const router = useRouter();

	useEffect(() => {
		const checkUser = async () => {
			try {
				const res = await fetch(`${BASE_URL_AUTH_SER}/auth/me`, {
					credentials: "include",
				});

				if (!res.ok) {
					throw new Error("Unauthorized");
				}

				const data = await res.json();
				const tenants = data.user.tenants;

				// No tenants → create workspace
				if (!tenants || tenants.length === 0) {
					router.replace("/create-workspace");
					return;
				}

				// One tenant → auto select
				if (tenants.length === 1) {
					const tenantId = tenants[0].id;
					router.replace(`/${tenantId}/dashboard`);
					return;
				}

				// Multiple tenants → selection page
				router.replace("/select-workspace");
			} catch {
				router.replace("/login");
			}
		};

		checkUser();
	}, [router]);

	return (
		<div className="h-screen flex items-center justify-center">
			<p className="text-neutral-700">Preparing your workspace...</p>
		</div>
	);
}
