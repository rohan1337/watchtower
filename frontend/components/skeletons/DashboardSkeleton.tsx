"use client";

import Skeleton from "@/components/common/Skeleton";

export default function DashboardSkeleton() {
	return (
		<div className="space-y-8">
			<div>
				<Skeleton className="h-6 w-64 mb-2" />
				<Skeleton className="h-4 w-96" />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className="h-24 w-full rounded-xl" />
				))}
			</div>

			<Skeleton className="h-48 w-full rounded-xl" />
			<Skeleton className="h-64 w-full rounded-xl" />
		</div>
	);
}
