"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import ProfileSettings from "./components/ProfileSettings";
import PasswordSettings from "./components/PasswordSettings";
import NotificationSettings from "./components/NotificationSettings";
import PreferencesSettings from "./components/PreferenceSettings";
import ApiKeysSettings from "./components/ApiKeysSettings";
import PageHeader from "@/components/common/PageHeader";

const tabs = [
	"Profile",
	"Password",
	"Notifications",
	"Preferences",
	"API Keys",
];

export default function SettingsPage() {
	const [activeTab, setActiveTab] = useState("Profile");

	const renderTab = () => {
		switch (activeTab) {
			case "Profile":
				return <ProfileSettings />;
			case "Password":
				return <PasswordSettings />;
			case "Notifications":
				return <NotificationSettings />;
			case "Preferences":
				return <PreferencesSettings />;
			case "API Keys":
				return <ApiKeysSettings />;
			default:
				return <ProfileSettings />;
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<PageHeader icon={<Settings />} title="Settings" />

			<div
				className="flex gap-4 border-b border-neutral-300 mb-6"
				role="tablist"
			>
				{tabs.map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`pb-2 cursor-pointer ${
							activeTab === tab
								? "border-b-2 border-neutral-900 text-neutral-900"
								: "text-gray-500"
						}`}
						role="tab"
						aria-selected={activeTab === tab}
					>
						{tab}
					</button>
				))}
			</div>

			<div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
				{renderTab()}
			</div>
		</div>
	);
}
