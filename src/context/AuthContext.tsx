import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthTokens } from "../types";
import { loginWithPassword, logout as authLogout } from "../services/auth";
import { setTokens, getAccessToken, clearTokens } from "../services/api";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: AuthTokens | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tokens, setTokensState] = useState<AuthTokens | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginWithPassword(email, password);
    setTokens(result);
    setTokensState(result);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    authLogout();
    clearTokens();
    setTokensState(null);
    setIsAuthenticated(false);
    navigate("/login");
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, tokens, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
