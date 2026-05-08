import { useState } from "react";

export default function PreferencesSettings() {
	const [theme, setTheme] = useState("light");

	return (
		<div className="space-y-4">
			<label className="block">Theme</label>

			<select
				value={theme}
				onChange={(e) => setTheme(e.target.value)}
				className="border p-2 rounded"
			>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
			</select>
		</div>
	);
}
