import { ReactNode } from "react";

type AuthLayoutProps = {
	title: string;
	subtitle?: string;
	children: ReactNode;
};

const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => {
	return (
		<div className="flex min-h-screen items-center justify-center bg-neutral-100">
			<div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
				<h1 className="mb-2 text-xl font-semibold text-neutral-900">
					{title}
				</h1>

				{subtitle && (
					<p className="mb-6 text-sm text-neutral-600">{subtitle}</p>
				)}

				{children}
			</div>
		</div>
	);
};

export default AuthLayout;
