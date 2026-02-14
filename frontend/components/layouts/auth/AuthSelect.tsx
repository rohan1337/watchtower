type AuthSelectOption = {
	value: string;
	label: string;
};

type AuthSelectProps = {
	label: string;
	name: string;
	value: string;
	options: AuthSelectOption[];
	required?: boolean;
	onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

const AuthSelect = ({
	label,
	name,
	value,
	options,
	required,
	onChange,
}: AuthSelectProps) => {
	return (
		<div>
			<label className="mb-1 block text-sm font-medium text-neutral-700">
				{label} {required && "*"}
			</label>

			<select
				name={name}
				value={value}
				onChange={onChange}
				className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 focus:border-neutral-900 focus:outline-none"
			>
				<option value="">Select {label}</option>

				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
};

export default AuthSelect;
