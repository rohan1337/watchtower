import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "../../../components/layouts/Sidebar";
import Topbar from "../../../components/layouts/Topbar";
import TenantProvider from "@/app/contexts/tenant-context/TenantProvider";

const BASE_URL_AUTH_SER = process.env.NEXT_PUBLIC_API_BASE_URL_AUTH_SER;

type Tenant = {
	id: string;
	name: string;
	role: string;
	slug: string;
};

export default async function TenantLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	const cookieStore = await cookies();

	const cookieHeader = cookieStore
		.getAll()
		.map((cookie) => `${cookie.name}=${cookie.value}`)
		.join("; ");

	const res = await fetch(`${BASE_URL_AUTH_SER}/auth/me`, {
		headers: {
			Cookie: cookieHeader,
		},
		cache: "no-store",
	});

	if (!res.ok) {
		redirect("/login");
	}

	const data = await res.json();
	const selectedTenantId = data.user.selectedTenantId;

	// No active tenant
	if (!selectedTenantId) {
		redirect("/create-workspace");
	}

	// 🔥 Find tenant by slug instead of ID
	const tenant = data.user.tenants.find((t: Tenant) => t.slug === slug);

	if (!tenant) {
		redirect("/create-workspace");
	}

	// 🔥 If selected tenant in token does not match URL slug
	if (selectedTenantId !== tenant.id) {
		redirect(`/${tenant.slug}/dashboard`);
	}

	return (
		<TenantProvider tenant={tenant}>
			<div className="flex h-screen">
				<Sidebar slug={tenant.slug} />
				<div className="flex-1 flex flex-col">
					<Topbar tenantId={tenant.id} tenantName={tenant.name} />
					<main className="p-6 bg-neutral-50 flex-1 overflow-y-auto">
						{children}
					</main>
				</div>
			</div>
		</TenantProvider>
	);
}
