"use client";

import { api } from "@/api/instance";
import { messageToast } from "@/helpers/toastHelper";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type AuthContextType = {
  user: User | null;
  loginSuccess: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loginSuccess = (user: User) => {
    setUser(user);
  };

  const logout = async () => {

    try {
      localStorage.removeItem("token");
      const response = await api.post('/logout');
      if (response.status === 200) {
        setUser(null);
        router.replace('/login');
        messageToast.success("Đăng xuất thành công");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }

  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Gọi API route để Server kiểm tra HttpOnly cookie
        const response = await api.get('/login/status');

        if (response.status === 200) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error("Failed to check auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loginSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
