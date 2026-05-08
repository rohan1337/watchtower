import React from "react";

type ButtonProps = {
	children: React.ReactNode;
	onClick?: () => void;
	type?: "button" | "submit" | "reset";
	variant?: "primary" | "secondary" | "danger";
	loading?: boolean;
	disabled?: boolean;
	className?: string;
};

export default function Button({
	children,
	onClick,
	type = "button",
	variant = "primary",
	loading = false,
	disabled = false,
	className = "",
}: ButtonProps) {
	const baseStyles = "px-4 py-2 rounded-md text-sm font-medium transition";

	const variants = {
		primary: "bg-blue-500 text-white",
		secondary: "bg-gray-200 text-gray-800",
		danger: "bg-red-500 text-white",
	};

	const hoverVariants = {
		primary: "hover:bg-blue-600",
		secondary: "hover:bg-gray-300",
		danger: "hover:bg-red-600",
	};

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled || loading}
			aria-busy={loading}
			aria-disabled={disabled || loading || undefined}
			className={`${baseStyles} ${variants[variant]} ${
				!(disabled || loading) ? hoverVariants[variant] : ""
			} ${
				disabled || loading
					? "opacity-50 cursor-not-allowed"
					: "cursor-pointer"
			} ${className}`}
		>
			{loading ? "Processing..." : children}
		</button>
	);
}
