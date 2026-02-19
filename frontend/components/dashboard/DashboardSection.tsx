"use client";

export default function DashboardSection({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
			<h2 className="text-lg font-semibold mb-4 text-neutral-900">
				{title}
			</h2>
			{children}
		</div>
	);
}
