"use client";

import Skeleton from "@/components/common/Skeleton";

export default function IncidentDetailSkeleton() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="space-y-3">
				<Skeleton className="h-6 w-72" />
				<div className="flex gap-3">
					<Skeleton className="h-6 w-20 rounded-full" />
					<Skeleton className="h-6 w-20 rounded-full" />
					<Skeleton className="h-4 w-32" />
				</div>
			</div>

			{/* Description */}
			<div className="rounded-lg border border-neutral-200 bg-white p-4">
				<Skeleton className="h-4 w-40 mb-3" />
				<Skeleton className="h-4 w-full mb-2" />
				<Skeleton className="h-4 w-5/6" />
			</div>

			{/* Main Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Timeline */}
				<div className="lg:col-span-2 rounded-lg border bg-white p-4 space-y-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="space-y-2">
							<Skeleton className="h-4 w-48" />
							<Skeleton className="h-3 w-72" />
						</div>
					))}
				</div>

				{/* Side Panel */}
				<div className="space-y-4">
					<div className="rounded-lg border bg-white p-4 space-y-3">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-8 w-full rounded-md" />
						<Skeleton className="h-8 w-full rounded-md" />
						<Skeleton className="h-8 w-full rounded-md" />
					</div>

					<div className="rounded-lg border bg-white p-4 space-y-3">
						<Skeleton className="h-4 w-40" />
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-4 w-32" />
					</div>
				</div>
			</div>
		</div>
	);
}
