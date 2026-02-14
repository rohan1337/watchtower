import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const BASE_URL_AUTH_SER = process.env.NEXT_PUBLIC_API_BASE_URL_AUTH_SER;

export default async function DashboardPage({
	params,
}: {
	params: { tenantId: string };
}) {
	const cookieStore = cookies();

	const res = await fetch(`${BASE_URL_AUTH_SER}/auth/me`, {
		headers: {
			Cookie: cookieStore.toString(),
		},
		cache: "no-store",
	});

	if (!res.ok) {
		redirect("/login");
	}

	const data = await res.json();

	const tenant = data.user.tenants.find((t: any) => t.id === params.tenantId);

	if (!tenant) {
		redirect("/select-tenant");
	}

	return (
		<div>
			<h1 className="text-2xl font-semibold">Welcome to {tenant.name}</h1>
			<p className="text-neutral-600 mt-2">Role: {tenant.role}</p>
		</div>
	);
}
