"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import AuthPasswordInput from "@/components/auth/AuthPasswordInput";
import AuthError from "@/components/auth/AuthError";
import AuthButton from "@/components/auth/AuthButton";
import AuthFooterLink from "@/components/auth/AuthFooterLink";

const BASE_URL_AUTH_SER = process.env.NEXT_PUBLIC_API_BASE_URL_AUTH_SER;

const RegisterPage = () => {
	const [formData, setFormData] = useState({
		name: "",
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

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setErrors([]);

		if (!formData.email || !formData.password) {
			setErrors(["Email and password is required"]);
			return;
		}

		try {
			const res = await fetch(`${BASE_URL_AUTH_SER}/auth/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify(formData),
			});

			if (!res.ok) {
				const data = await res.json();
				setErrors([data.message || "Something went wrong"]);
				return;
			}

			toast.success("Verification email sent!");
			localStorage.setItem("pending_email", formData.email);
			setFormData({ name: "", email: "", password: "" });
			setShowPassword(false);
			router.push("/email-sent");
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
			title="Create Your Watchtower Account"
			subtitle="Set up your personal access to Watchtower"
		>
			<form className="space-y-4" onSubmit={handleSubmit}>
				<AuthInput
					label="Your Name"
					name="name"
					value={formData.name}
					placeholder="Enter your name"
					onChange={handleChange}
				/>

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
					text="Create Account"
					loadingText="Creating Account..."
				/>
			</form>

			<AuthFooterLink
				text="Already have an account?"
				linkText="Login"
				href="/login"
			/>
		</AuthLayout>
	);
};

export default RegisterPage;
