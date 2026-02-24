"use client";

import { Loader2 } from "lucide-react";

type Props = {
	size?: number;
	className?: string;
};

export default function Loader({ size = 20, className = "" }: Props) {
	return (
		<Loader2
			size={size}
			className={`animate-spin text-neutral-600 ${className}`}
		/>
	);
}
