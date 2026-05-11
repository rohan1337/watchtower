import { useState, useEffect } from "react";
import axios from "axios";

export default function NotificationSettings() {
	const [settings, setSettings] = useState({
		emailNotifications: true,
		smsNotifications: false,
	});
	const [error, setError] = useState("");

	useEffect(() => {
		axios
			.get("/users/notification-settings")
			.then((res) => setSettings(res.data))
			.catch(() => setError("Failed to load notification settings"));
	}, []);

	const updateSetting = async (field: string, value: boolean) => {
		const previousSettings = { ...settings };

		// optimistic update
		setSettings((prev) => ({ ...prev, [field]: value }));

		try {
			await axios.put("/users/notification-settings", {
				[field]: value,
			});
		} catch {
			// rollback
			setSettings(previousSettings);
			setError("Failed to save setting");
		}
	};

	const labelDesign = "text-neutral-700 cursor-pointer";
	const checkboxDesign =
		"form-checkbox h-4 w-4 text-blue-500 hover:text-blue-700 cursor-pointer transition-all duration-200 ease-in-out";

	return (
		<div className="space-y-4">
			<label className="flex items-center justify-between">
				<span className={labelDesign}>Email Notifications</span>
				<input
					type="checkbox"
					checked={settings.emailNotifications}
					className={checkboxDesign}
					onChange={() =>
						updateSetting(
							"emailNotifications",
							!settings.emailNotifications,
						)
					}
				/>
			</label>

			<label className="flex items-center justify-between">
				<span className={labelDesign}>SMS Notifications</span>
				<input
					type="checkbox"
					checked={settings.smsNotifications}
					className={checkboxDesign}
					onChange={() =>
						updateSetting(
							"smsNotifications",
							!settings.smsNotifications,
						)
					}
				/>
			</label>

			{error && <p className="text-red-500 text-sm">{error}</p>}
		</div>
	);
}
