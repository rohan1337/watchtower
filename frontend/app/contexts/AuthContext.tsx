"use client";

import { createContext, useContext, useEffect, useState } from "react";

const BASE_URL_AUTH_SER = process.env.NEXT_PUBLIC_API_BASE_URL_AUTH_SER;

type Tenant = {
	id: string;
	name: string;
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
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchUser = async () => {
		try {
			const res = await fetch(`${BASE_URL_AUTH_SER}/auth/me`, {
				credentials: "include",
			});

			if (!res.ok) {
				setUser(null);
				return;
			}

			const data = await res.json();
			setUser(data.user);
		} catch {
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUser();
	}, []);

	return (
		<AuthContext.Provider
			value={{ user, loading, refreshUser: fetchUser, setUser }}
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
