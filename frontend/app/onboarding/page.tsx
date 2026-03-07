"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function OnboardingPage() {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (loading) return;

		if (!user) {
			router.replace("/login");
			return;
		}

		if (!user.tenants?.length) {
			router.replace("/create-workspace");
			return;
		}

		// if (user.tenants.length === 1) {
		// 	router.replace(`/${user.tenants[0].slug}/dashboard`);
		// 	return;
		// }

		if (user.tenants.length === 1) {
			router.replace("/select-workspace");
			return;
		}

		router.replace("/select-workspace");
	}, [user, loading]);

	return (
		<div className="h-screen bg-neutral-100 flex items-center justify-center">
			<p className="text-neutral-700">Preparing your workspace...</p>
		</div>
	);
}
