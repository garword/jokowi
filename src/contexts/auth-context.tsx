"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => boolean;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    const authStatus = localStorage.getItem("isAuthenticated");
    const rememberMe = localStorage.getItem("remember_me") === "true";
    
    // Auto-login if remember me was checked
    if (authStatus === "true" && rememberMe) {
      setIsAuthenticated(true);
      // Set cookie with extended expiration for remember me
      document.cookie = "isAuthenticated=true; path=/; max-age=604800"; // 7 days
    } else if (authStatus === "true") {
      setIsAuthenticated(true);
      // Set regular cookie for session
      document.cookie = "isAuthenticated=true; path=/; max-age=86400"; // 24 hours
    }
    
    setLoading(false);
  }, []);

  const login = (username: string, password: string, rememberMe: boolean = false): boolean => {
    // Check credentials (username: windaa, password: cantik)
    if (username === "windaa" && password === "cantik") {
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
      
      // Set cookie with different expiration based on remember me
      if (rememberMe) {
        // Extended cookie for remember me (7 days)
        document.cookie = "isAuthenticated=true; path=/; max-age=604800";
        localStorage.setItem("remember_me", "true");
      } else {
        // Regular session cookie (24 hours)
        document.cookie = "isAuthenticated=true; path=/; max-age=86400";
        localStorage.setItem("remember_me", "false");
      }
      
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("remember_me");
    localStorage.removeItem("remembered_username");
    // Remove cookie
    document.cookie = "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}