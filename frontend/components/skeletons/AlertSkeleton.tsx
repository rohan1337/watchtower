"use client";

import Skeleton from "@/components/common/Skeleton";

export default function AlertsSkeleton() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Skeleton className="h-5 w-5 rounded" />
					<Skeleton className="h-6 w-28" />
				</div>

				<Skeleton className="h-8 w-24 rounded-md" />
			</div>

			{/* Table */}
			<div className="rounded-lg border border-neutral-200 bg-white p-4 space-y-4">
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={i}
						className="flex items-center justify-between gap-6"
					>
						{/* Alert message column */}
						<div className="space-y-2 w-1/3">
							<Skeleton className="h-4 w-56" />
							<Skeleton className="h-3 w-24" />
						</div>

						{/* Severity badge */}
						<Skeleton className="h-6 w-20 rounded-full" />

						{/* Source */}
						<Skeleton className="h-4 w-28" />

						{/* Time */}
						<Skeleton className="h-4 w-20" />

						{/* Incident link */}
						<Skeleton className="h-4 w-24" />
					</div>
				))}
			</div>
		</div>
	);
}
