"use client";

import { authApi } from "@/lib/api/authApi";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { useRouter } from "next/navigation";
import { setLogoutHandler } from "@/lib/logout";

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
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchUser = async () => {
		try {
			const res = await authApi.get("/auth/me");
			setUser({
				id: res.data.user.id,
				tenants: res.data.user.tenants || [],
				selectedTenantId: res.data.user.selectedTenantId ?? null,
			});
		} catch {
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	const signOut = useCallback(async () => {
		try {
			await authApi.post("/auth/logout");
		} catch {}

		setUser(null);
		router.replace("/login");
	}, [router]);

	useEffect(() => {
		fetchUser();
	}, []);

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
