import { CircleX } from "lucide-react";

const AuthError = ({ messages }: { messages: string[] }) => {
	if (messages.length === 0) return null;

	return (
		<div className="p-2 rounded-md bg-red-200 flex gap-2">
			<CircleX className="h-4.25 w-4.25 text-red-700 mt-0.5" />
			<div className="space-y-1">
				{messages.map((msg, idx) => (
					<p key={idx} className="text-sm text-red-700">
						{msg}
					</p>
				))}
			</div>
		</div>
	);
};

export default AuthError;
