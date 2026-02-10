import { Eye, EyeOff } from "lucide-react";

type Props = {
	label: string;
	name: string;
	value: string;
	placeholder?: string;
	show: boolean;
	onToggle: () => void;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const AuthPasswordInput = ({
	label,
	name,
	value,
	placeholder,
	show,
	onToggle,
	onChange,
}: Props) => {
	return (
		<div>
			<label className="mb-1 block text-sm font-medium text-neutral-700">
				{label} *
			</label>
			<div className="relative">
				<input
					type={show ? "text" : "password"}
					name={name}
					value={value}
					placeholder={placeholder}
					onChange={onChange}
					className="w-full rounded-md border border-neutral-300 px-3 py-2 pr-10 text-sm text-neutral-700 focus:border-neutral-900 focus:outline-none"
				/>
				<button
					type="button"
					onClick={onToggle}
					className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 cursor-pointer hover:text-neutral-800 transition-all duration-200 ease-in-out"
				>
					{show ? <EyeOff size={18} /> : <Eye size={18} />}
				</button>
			</div>
		</div>
	);
};

export default AuthPasswordInput;
