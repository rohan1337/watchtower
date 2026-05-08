"use client";

import React, { useState } from "react";

type InputProps = {
	id?: string;
	label?: string;
	type?: string;
	value: string;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
	disabled?: boolean;
	error?: string;
};

export default function Input({
	id,
	label,
	type = "text",
	value,
	onChange,
	placeholder,
	disabled = false,
	error,
}: InputProps) {
	const [showPassword, setShowPassword] = useState(false);

	const isPassword = type === "password";

	return (
		<div className="space-y-1">
			{label && (
				<label
					className="inline-block mb-1 text-sm font-medium text-neutral-700"
					htmlFor={id}
				>
					{label}
				</label>
			)}

			<div className="relative">
				<input
					type={isPassword && showPassword ? "text" : type}
					id={id}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					disabled={disabled}
					className={`w-full px-3 py-2 border border-neutral-300 rounded-md text-sm text-neutral-700
						${disabled ? "bg-neutral-100 cursor-not-allowed" : "bg-white"}
						${error ? "border-red-500" : "border-neutral-300"}
						focus:outline-none focus:ring-2 focus:ring-neutral-700 placeholder:text-neutral-400`}
				/>
				{/* 👁️ Toggle Button */}
				{isPassword && (
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="absolute right-2 top-2 text-sm text-neutral-500 hover:text-neutral-700"
						aria-label={
							showPassword ? "Hide password" : "Show password"
						}
					>
						{showPassword ? "🙈" : "👁️"}
					</button>
				)}
			</div>

			{error && <p className="text-xs text-red-500">{error}</p>}
		</div>
	);
}
