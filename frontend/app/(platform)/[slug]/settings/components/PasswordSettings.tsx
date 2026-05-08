import { useState } from "react";
import axios from "axios";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

export default function PasswordSettings() {
	const [form, setForm] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleChange =
		(field: keyof typeof form) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setForm({ ...form, [field]: e.target.value });
		};

	const handleSubmit = async () => {
		// 🔴 Validation (must-have)
		if (
			!form.currentPassword ||
			!form.newPassword ||
			!form.confirmPassword
		) {
			return setError("All fields are required");
		}

		if (form.newPassword !== form.confirmPassword) {
			return setError("Passwords do not match");
		}
		try {
			setLoading(true);
			setError("");

			await axios.put("/api/users/change-password", {
				currentPassword: form.currentPassword,
				newPassword: form.newPassword,
			});

			alert("Password updated");
			setForm({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		} catch (err) {
			if (axios.isAxiosError(err)) {
				setError(err.response?.data?.message || "Something went wrong");
			} else {
				setError("Something went wrong");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			<Input
				label="Current Password"
				id="currentPassword"
				type="password"
				value={form.currentPassword}
				placeholder="Enter Current Password"
				onChange={handleChange("currentPassword")}
			/>

			<Input
				label="New Password"
				id="newPassword"
				type="password"
				value={form.newPassword}
				placeholder="Enter New Password"
				onChange={handleChange("newPassword")}
			/>

			<Input
				label="Confirm Password"
				id="confirmPassword"
				type="password"
				value={form.confirmPassword}
				placeholder="Confirm New Password"
				error={error}
				onChange={handleChange("confirmPassword")}
			/>

			<Button
				onClick={handleSubmit}
				loading={loading}
				className="display-right"
			>
				Update Password
			</Button>
		</div>
	);
}
