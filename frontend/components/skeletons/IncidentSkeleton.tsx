"use client";

import Skeleton from "@/components/common/Skeleton";

export default function IncidentsSkeleton() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Skeleton className="h-5 w-5 rounded" />
					<Skeleton className="h-6 w-32" />
				</div>

				<Skeleton className="h-8 w-24 rounded-md" />
			</div>

			{/* Table */}
			<div className="rounded-lg border border-neutral-200 bg-white p-4 space-y-4">
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={i}
						className="flex items-center justify-between gap-4"
					>
						<div className="space-y-2 w-1/3">
							<Skeleton className="h-4 w-48" />
							<Skeleton className="h-3 w-24" />
						</div>

						<Skeleton className="h-6 w-20 rounded-full" />
						<Skeleton className="h-6 w-24 rounded-full" />
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-4 w-20" />
					</div>
				))}
			</div>
		</div>
	);
}
