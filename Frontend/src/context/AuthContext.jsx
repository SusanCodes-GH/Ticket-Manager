import { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as authService from "../services/authService";
import * as userService from "../services/userService";

const AuthContext = createContext(null);

const STORAGE_KEY = "ticketmgr_current_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const userData = await authService.login(email, password);
      const normalized = { ...userData, id: userData.uid || userData.id };
      setUser(normalized);
      return normalized;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true);
    try {
      const userData = await authService.registerAdmin(data);
      return userData;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const hasRole = useCallback(
    (...roles) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const refreshUser = useCallback(async () => {
    try {
      const fresh = await authService.refresh();
      const normalized = { ...fresh, id: fresh.uid || fresh.id };
      setUser(normalized);
      return normalized;
    } catch {
      return null;
    }
  }, []);

  const updateCurrentUser = useCallback((partial) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      return updated;
    });
  }, []);

  const value = {
    user,
    currentUser: user,
    loading,
    login,
    register,
    logout,
    hasRole,
    isAuthenticated: !!user,
    userService,
    refreshUser,
    updateCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
