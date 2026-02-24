import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type SortDirection = "asc" | "desc";

type TableHeaderProps<K extends string> = {
	children: React.ReactNode;
	align?: "left" | "center" | "right";
	sortable?: boolean;
	sortKey?: K;
	activeSortKey?: K;
	direction?: SortDirection;
	onSort?: (key: K) => void;
};

export default function TableHeader<K extends string>({
	children,
	align = "left",
	sortable = false,
	sortKey,
	activeSortKey,
	direction,
	onSort,
}: TableHeaderProps<K>) {
	const alignment =
		align === "center"
			? "text-center"
			: align === "right"
				? "text-right"
				: "text-left";

	const isActive = activeSortKey === sortKey;

	return (
		<th
			className={`
				px-4 py-3 text-sm font-semibold uppercase tracking-wide text-neutral-700 ${alignment}
				${sortable ? "cursor-pointer" : "cursor-default"}
			`}
			onClick={() => {
				if (sortable && sortKey) onSort?.(sortKey);
			}}
		>
			<div className="flex items-center gap-1">
				{children}

				{sortable && !isActive && <ArrowUpDown size={14} />}
				{sortable && isActive && direction === "asc" && (
					<ArrowUp size={14} />
				)}
				{sortable && isActive && direction === "desc" && (
					<ArrowDown size={14} />
				)}
			</div>
		</th>
	);
}
