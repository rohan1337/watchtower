"use client";

const COLORS = {
	red: {
		bg: "bg-red-50",
		text: "text-red-600",
	},
	yellow: {
		bg: "bg-yellow-50",
		text: "text-yellow-600",
	},
	orange: {
		bg: "bg-orange-50",
		text: "text-orange-600",
	},
	green: {
		bg: "bg-green-50",
		text: "text-green-600",
	},
};

export default function SeverityCard({
	label,
	count,
	color,
}: {
	label: string;
	count: string;
	color: keyof typeof COLORS;
}) {
	const styles = COLORS[color];

	return (
		<div
			className={`p-4 rounded-lg flex flex-col gap-1 justify-center items-center ${styles.bg}`}
		>
			<p className="text-md text-neutral-900">{label}</p>
			<p className={`text-xl font-semibold ${styles.text}`}>{count}</p>
		</div>
	);
}
