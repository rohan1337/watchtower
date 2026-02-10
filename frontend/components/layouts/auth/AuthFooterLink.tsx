import Link from "next/link";

type AuthFooterLinkProps = {
	text: string;
	linkText: string;
	href: string;
};

const AuthFooterLink = ({ text, linkText, href }: AuthFooterLinkProps) => {
	return (
		<p className="mt-2 text-center text-sm text-neutral-600">
			{text}{" "}
			<Link
				href={href}
				className="font-medium text-neutral-900 hover:underline"
			>
				{linkText}
			</Link>
		</p>
	);
};

export default AuthFooterLink;
