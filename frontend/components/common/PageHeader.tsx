import React from "react";

type PageHeaderProps = {
	icon?: React.ReactNode;
	title: string;
	action?: React.ReactNode; // optional right-side button or dropdown
};

export default function PageHeader({ icon, title, action }: PageHeaderProps) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-3">
				{icon && <div className="text-neutral-900">{icon}</div>}
				<h1 className="text-lg font-semibold text-neutral-900">
					{title}
				</h1>
			</div>

			{action && <div>{action}</div>}
		</div>
	);
}
