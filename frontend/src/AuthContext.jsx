import { createContext, useContext, useMemo, useState } from "react";
import api from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("dcb_user");
    return raw ? JSON.parse(raw) : null;
  });

  const value = useMemo(
    () => ({
      user,
      async login(email, password) {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("dcb_token", data.token);
        localStorage.setItem("dcb_user", JSON.stringify(data.user));
        setUser(data.user);
      },
      logout() {
        localStorage.removeItem("dcb_token");
        localStorage.removeItem("dcb_user");
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
