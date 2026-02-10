const AuthButton = ({
	loading,
	text,
	loadingText,
}: {
	loading: boolean;
	text: string;
	loadingText: string;
}) => {
	return (
		<button
			type="submit"
			disabled={loading}
			className="my-4 w-full rounded-md bg-neutral-900 py-2 text-sm font-medium text-white cursor-pointer hover:bg-neutral-800 disabled:opacity-50 transition-all duration-200 ease-in-out"
		>
			{loading ? loadingText : text}
		</button>
	);
};

export default AuthButton;
