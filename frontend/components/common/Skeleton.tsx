"use client";

type Props = {
	className?: string;
};

export default function Skeleton({ className = "" }: Props) {
	return (
		<div
			className={`relative overflow-hidden rounded-md bg-neutral-200 ${className}`}
		>
			<div className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-neutral-100/70 to-transparent" />
		</div>
	);
}
