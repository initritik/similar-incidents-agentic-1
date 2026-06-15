import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { PropsWithChildren } from "react";

export interface UserProfile {
  username: string;
  appName: string;
  welcomeTeam: string;
}

const USERS: Record<string, { password: string; appName: string; welcomeTeam: string }> = {
  arijit:  { password: "arijit",  appName: "LSC AI RESOLUTION",     welcomeTeam: "LSC"     },
  aswini:  { password: "aswini",  appName: "ORYX AI RESOLUTION",    welcomeTeam: "ORYX"    },
  paulomi: { password: "paulomi", appName: "IRELAND AI RESOLUTION",  welcomeTeam: "IRELAND" },
  admin:   { password: "admin",   appName: "ADMIN AI RESOLUTION",  welcomeTeam: "ADMIN"   },
};

interface AuthContextValue {
  user: UserProfile | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = useCallback((username: string, password: string): boolean => {
    const key = username.trim().toLowerCase();
    const record = USERS[key];
    localStorage.setItem("username", key); 
    localStorage.setItem("password", password.trim()); 

    if (!record || record.password !== password.trim()) return false;
    setUser({ username: key, appName: record.appName, welcomeTeam: record.welcomeTeam });
    return true;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedPassword = localStorage.getItem("password");
    if (storedUsername && storedPassword) {
      login(storedUsername, storedPassword);
    }
  }, [login]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}