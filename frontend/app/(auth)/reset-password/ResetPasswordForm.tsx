"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthPasswordInput from "@/components/auth/AuthPasswordInput";
import AuthError from "@/components/auth/AuthError";
import AuthButton from "@/components/auth/AuthButton";
import AuthFooterLink from "@/components/auth/AuthFooterLink";

const BASE_URL_AUTH_SER = process.env.NEXT_PUBLIC_API_BASE_URL_AUTH_SER;

export default function ResetPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const token = searchParams.get("token");

	const [formData, setFormData] = useState({
		token: "",
		newPassword: "",
		confirmPassword: "",
	});

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<string[]>([]);

	// ✅ Inject token once on mount
	useEffect(() => {
		if (!token) {
			setErrors(["Invalid or expired reset link"]);
			return;
		}

		setFormData((prev) => ({
			...prev,
			token,
		}));
	}, [token]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (errors.length > 0) {
			setErrors([]);
		}

		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// 🔴 Frontend validation first
		if (formData.newPassword !== formData.confirmPassword) {
			setErrors(["Passwords do not match"]);
			return;
		}

		setLoading(true);
		setErrors([]);

		try {
			const res = await fetch(
				`${BASE_URL_AUTH_SER}/auth/reset-password`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						token: formData.token,
						newPassword: formData.newPassword,
					}),
				},
			);

			if (!res.ok) {
				const data = await res.json();
				throw new Error(JSON.stringify(data));
			}

			toast.success("Password reset successfully");
			router.push("/login");
		} catch (err: any) {
			try {
				const parsed = JSON.parse(err.message);
				const firstMsg =
					parsed?.errors?.[0]?.errors?.[0] || "Something went wrong";
				setErrors([firstMsg]);
			} catch {
				setErrors(["Unexpected error"]);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthLayout
			title="Set a new password"
			subtitle="Password must be at least 8 characters and include uppercase, lowercase, number, and symbol"
		>
			<form className="space-y-4" onSubmit={handleSubmit}>
				<AuthPasswordInput
					label="New Password"
					name="newPassword"
					value={formData.newPassword}
					placeholder="Enter new password"
					show={showPassword}
					onToggle={() => setShowPassword(!showPassword)}
					onChange={handleChange}
				/>

				<AuthPasswordInput
					label="Confirm Password"
					name="confirmPassword"
					value={formData.confirmPassword}
					placeholder="Confirm new password"
					show={showConfirmPassword}
					onToggle={() =>
						setShowConfirmPassword(!showConfirmPassword)
					}
					onChange={handleChange}
				/>

				<AuthError messages={errors} />

				<AuthButton
					loading={loading}
					text="Reset Password"
					loadingText="Resetting Password..."
				/>
			</form>

			<AuthFooterLink text="Back to" linkText="Login" href="/login" />
		</AuthLayout>
	);
}
