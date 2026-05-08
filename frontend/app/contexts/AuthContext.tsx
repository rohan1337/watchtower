"use client";

import { authApi } from "@/lib/api/authApi";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { useRouter } from "next/navigation";
import { setLogoutHandler } from "@/lib/logout";
import { usePathname } from "next/navigation";

type Tenant = {
	id: string;
	name: string;
	slug: string;
	role: string;
};

type User = {
	id: string;
	tenants: Tenant[];
	selectedTenantId: string | null;
};

type AuthContextType = {
	user: User | null;
	loading: boolean;
	refreshUser: () => Promise<void>;
	setUser: (user: User | null) => void;
	signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const hasTriedRefreshRef = useRef(false);

	const fetchUser = useCallback(async () => {
		try {
			const res = await authApi.get("/auth/me");

			setUser({
				id: res.data.user.id,
				tenants: res.data.user.tenants || [],
				selectedTenantId: res.data.user.selectedTenantId ?? null,
			});

			// reset retry only on success
			hasTriedRefreshRef.current = false;
		} catch {
			if (!hasTriedRefreshRef.current) {
				hasTriedRefreshRef.current = true;

				try {
					await authApi.post("/auth/refresh");
					return await fetchUser();
				} catch {
					setUser(null);
				}
			} else {
				setUser(null);
			}
		} finally {
			setLoading(false);
		}
	}, []);

	const signOut = useCallback(async () => {
		try {
			await authApi.post("/auth/logout");
		} catch {}

		setUser(null);
		router.replace("/login");
	}, [router]);

	useEffect(() => {
		const publicRoutes = ["/login", "/register", "/email-sent"];

		if (publicRoutes.includes(pathname)) {
			setLoading(false);
			return;
		}

		fetchUser();
	}, [pathname]);

	useEffect(() => {
		setLogoutHandler(signOut);
	}, [signOut]);

	return (
		<AuthContext.Provider
			value={{ user, loading, refreshUser: fetchUser, setUser, signOut }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within AuthProvider");
	return context;
}
