import Sidebar from "@/components/layouts/Sidebar";
import Topbar from "@/components/layouts/Topbar";

export default function TenantLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex h-screen">
			<Sidebar />
			<div className="flex flex-1 flex-col">
				<Topbar />
				<main className="flex-1 overflow-y-auto bg-neutral-50 p-6">
					{children}
				</main>
			</div>
		</div>
	);
}
