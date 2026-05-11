"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import AuthPasswordInput from "@/components/auth/AuthPasswordInput";
import AuthError from "@/components/auth/AuthError";
import AuthButton from "@/components/auth/AuthButton";
import AuthFooterLink from "@/components/auth/AuthFooterLink";
import { useAuth } from "../../contexts/AuthContext";
import { setAccessToken } from "@/lib/tokenStore";
import { initSocket } from "@/lib/socket";

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
	const { setUser } = useAuth();

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

		if (!formData.email || !formData.password) {
			setErrors(["Email and password is required"]);
			setLoading(false);
			return;
		}

		try {
			const res = await fetch(`${BASE_URL_AUTH_SER}/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include", // 🔴 REQUIRED
				body: JSON.stringify(formData),
			});

			const data = await res.json();

			if (!res.ok) {
				setErrors([data.message || "Invalid credentials"]);
				return;
			}

			// Store access token globally
			setAccessToken(data.accessToken);

			// Set user immediately
			setUser({
				id: data.user.id,
				tenants: data.tenants,
				selectedTenantId: null,
			});

			setFormData({ email: "", password: "" });
			setShowPassword(false);

			// Redirect to onboarding
			router.replace("/onboarding");
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
