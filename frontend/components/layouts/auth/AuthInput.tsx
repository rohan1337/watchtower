type AuthInputProps = {
	label: string;
	name: string;
	type?: string;
	value: string;
	placeholder?: string;
	required?: boolean;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const AuthInput = ({
	label,
	name,
	type = "text",
	value,
	placeholder,
	required,
	onChange,
}: AuthInputProps) => {
	return (
		<div>
			<label className="mb-1 block text-sm font-medium text-neutral-700">
				{label} {required && "*"}
			</label>
			<input
				type={type}
				name={name}
				value={value}
				placeholder={placeholder}
				onChange={onChange}
				className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 focus:border-neutral-900 focus:outline-none"
			/>
		</div>
	);
};

export default AuthInput;
