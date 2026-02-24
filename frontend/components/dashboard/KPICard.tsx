"use client";

export default function KPICard({
	title,
	value,
	color,
}: {
	title: string;
	value: number;
	color: string;
}) {
	return (
		<div
			className={`p-4 rounded-xl shadow-sm ${color} flex flex-col gap-1 justify-center items-center`}
		>
			<p className="text-lg font-bold text-white">{title}</p>
			<p className="text-2xl font-semibold text-white">{value}</p>
		</div>
	);
}
