type TableContainerProps = {
	children: React.ReactNode;
	className?: string;
};

export default function TableContainer({
	children,
	className = "",
}: TableContainerProps) {
	return (
		<div
			className={`overflow-hidden rounded-lg border border-neutral-700 bg-white ${className}`}
		>
			<table className="min-w-full divide-y divide-neutral-700">
				{children}
			</table>
		</div>
	);
}
