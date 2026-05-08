import { useState } from "react";

export default function ApiKeysSettings() {
	const [keys, setKeys] = useState([]);

	const generateKey = () => {
		const newKey = Math.random().toString(36).substring(2);
		setKeys([...keys, newKey]);
	};

	return (
		<div className="space-y-4">
			<button
				onClick={generateKey}
				className="bg-purple-500 text-white px-4 py-2 rounded"
			>
				Generate API Key
			</button>

			<ul className="space-y-2">
				{keys.map((key) => (
					<li key={key} className="bg-gray-100 p-2 rounded text-sm">
						{key}
					</li>
				))}
			</ul>
		</div>
	);
}
