import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "../../../components/layouts/Sidebar";
import Topbar from "../../../components/layouts/Topbar";

const BASE_URL_AUTH_SER = process.env.NEXT_PUBLIC_API_BASE_URL_AUTH_SER;

export default async function TenantLayout({
	children,
	params,
}: {
	children: React.ReactNode;
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
		<div className="flex h-screen">
			<Sidebar tenantId={params.tenantId} />
			<div className="flex-1 flex flex-col">
				<Topbar tenantId={params.tenantId} tenantName={tenant.name} />
				<main className="p-6 bg-neutral-50 flex-1">{children}</main>
			</div>
		</div>
	);
}
