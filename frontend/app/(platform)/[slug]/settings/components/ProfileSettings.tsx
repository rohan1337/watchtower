import { useEffect, useState } from "react";
import axios from "axios";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

export default function ProfileSettings() {
	const [user, setUser] = useState({ name: "", email: "" });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		axios
			.get("/api/users/me")
			.then((res) => setUser(res.data))
			.catch((err) =>
				setError(
					err.response?.data?.message || "Failed to load profile",
				),
			)
			.finally(() => setLoading(false));
	}, []);

	const handleSave = async () => {
		try {
			await axios.put("/api/users/me", { name: user.name });
			alert("Updated");
		} catch (err) {
			if (axios.isAxiosError(err)) {
				setError(
					err.response?.data?.message || "Failed to save changes",
				);
			} else {
				setError("Failed to save changes");
			}
		}
	};

	return (
		<div className="space-y-4">
			{loading && <p className="text-sm text-neutral-500">Loading...</p>}
			{error && <p className="text-sm text-red-500">{error}</p>}

			<Input
				label="Name"
				id="name"
				value={user.name}
				placeholder="Enter Your Name"
				onChange={(e) => setUser({ ...user, name: e.target.value })}
			/>

			<Input label="Email" id="email" value={user.email} disabled />

			<Button onClick={handleSave}>Save Changes</Button>
		</div>
	);
}
