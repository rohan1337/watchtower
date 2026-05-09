"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AuthButton from "@/components/auth/AuthButton";
import AuthError from "@/components/auth/AuthError";
import AuthFooterLink from "@/components/auth/AuthFooterLink";
import AuthInput from "@/components/auth/AuthInput";
import AuthLayout from "@/components/auth/AuthLayout";

const BASE_URL_AUTH_SER = process.env.NEXT_PUBLIC_API_BASE_URL_AUTH_SER;

const ForgotPasswordPage = () => {
	const [formData, setFormData] = useState({ email: "" });
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<string[]>([]);

	const router = useRouter();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (errors.length) setErrors([]);
		setFormData({ email: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setErrors([]);

		try {
			const res = await fetch(
				`${BASE_URL_AUTH_SER}/api/auth/forgot-password`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(formData),
				},
			);

			if (!res.ok) {
				const data = await res.json();
				throw new Error(JSON.stringify(data));
			}

			toast.success("If the email exists, a reset link was sent");
			router.push("/email-sent");
		} catch (err: any) {
			try {
				const parsed = JSON.parse(err.message);
				const firstMsg = parsed?.errors?.[0]?.errors?.[0];
				setErrors([firstMsg || "Something went wrong"]);
			} catch {
				setErrors(["Unexpected error"]);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthLayout
			title="Reset Your Password"
			subtitle="We’ll send you a password reset link if the email exists"
		>
			<form className="space-y-4" onSubmit={handleSubmit}>
				<AuthInput
					label="Work Email"
					name="email"
					type="email"
					value={formData.email}
					placeholder="Enter your work email"
					required
					onChange={handleChange}
				/>

				<AuthError messages={errors} />

				<AuthButton
					loading={loading}
					text="Send Reset Link"
					loadingText="Sending Reset Link..."
				/>
			</form>

			<AuthFooterLink
				text="Remembered your password?"
				linkText="Go to Login"
				href="/login"
			/>
		</AuthLayout>
	);
};

export default ForgotPasswordPage;
