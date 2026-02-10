"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AuthLayout from "@/components/layouts/auth/AuthLayout";
import AuthInput from "@/components/layouts/auth/AuthInput";
import AuthPasswordInput from "@/components/layouts/auth/AuthPasswordInput";
import AuthError from "@/components/layouts/auth/AuthError";
import AuthButton from "@/components/layouts/auth/AuthButton";
import AuthFooterLink from "@/components/layouts/auth/AuthFooterLink";

const BASE_URL_AUTH_SER = process.env.NEXT_PUBLIC_API_BASE_URL_AUTH_SER;

const LoginPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<string[]>([]);

	const router = useRouter();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// Clear previous errors when user modifies any field
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
		setLoading(true);
		setErrors([]);

		try {
			const res = await fetch(`${BASE_URL_AUTH_SER}/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include", // 🔴 REQUIRED
				body: JSON.stringify(formData),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(JSON.stringify(data));
			}

			toast.success("Logged in successfully!");
			setFormData({ email: "", password: "" });
			setShowPassword(false);
			router.push("/dashboard");
		} catch (err: any) {
			try {
				const parsed = JSON.parse(err.message);

				if (parsed.errors && parsed.errors.length > 0) {
					const firstError = parsed.errors[0];
					const firstMessage = firstError.errors[0];
					setErrors([firstMessage]);
				} else {
					setErrors(["Unknown error"]);
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
			title="Login to Watchtower"
			subtitle="Incident & alert management platform"
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

				<AuthPasswordInput
					label="Password"
					name="password"
					value={formData.password}
					placeholder="Enter your password"
					show={showPassword}
					onToggle={() => setShowPassword(!showPassword)}
					onChange={handleChange}
				/>

				<AuthError messages={errors} />

				<AuthButton
					loading={loading}
					text="Login"
					loadingText="Logging in..."
				/>
			</form>

			<AuthFooterLink
				text="Forgot your password?"
				linkText="Reset password"
				href="/forgot-password"
			/>

			<AuthFooterLink
				text="Don't have an account?"
				linkText="Create a new account"
				href="/register"
			/>
		</AuthLayout>
	);
};

export default LoginPage;
