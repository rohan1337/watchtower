"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EmailSentPage() {
	const [email, setEmail] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		const storedEmail = localStorage.getItem("pending_email");
		setEmail(storedEmail);
	}, []);

	return (
		<div className="h-screen bg-neutral-100 flex items-center justify-center">
			<div className="bg-white p-6 shadow rounded w-100 text-center">
				<h2 className="text-xl text-neutral-700 font-semibold">
					Check your email
				</h2>

				<p className="text-neutral-600 mt-3">
					{email ? (
						<>
							A verification link has been sent to{" "}
							<span className="font-semibold">{email}</span>.
						</>
					) : (
						"A verification link has been sent to your email."
					)}
				</p>

				<div className="mt-6">
					<button
						onClick={() => router.push("/login")}
						className="text-sm text-neutral-600 hover:text-neutral-900"
					>
						Back to login
					</button>
				</div>
			</div>
		</div>
	);
}
