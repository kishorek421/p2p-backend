import React, { createContext, useState, useEffect, ReactNode } from "react";
import api from "../services/api";
import { useRouter } from "expo-router";
import { AUTH_TOKEN_KEY } from "@/constants/storage_keys";
import { GET_CUSTOMER_LEAD_DETAILS, LOGIN } from "@/constants/api_endpoints";
import { getItem, removeItem, setItem } from "@/utils/secure_store";

export const AuthContext = createContext({});

interface AuthProviderProps {
  children?: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const token = await getItem(AUTH_TOKEN_KEY);
      if (token) {
        try {
          const response = await api.get(GET_CUSTOMER_LEAD_DETAILS); // Replace with your own endpoint
          setUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user:", error);
        }
      } else {
        logout();
      }
      setLoading(false);
    };

    // loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post(LOGIN, { email, password });
      await setItem(AUTH_TOKEN_KEY, response.data.token);
      setUser(response.data.user);
      // Redirect to the home screen after login
      router.replace({ pathname: "./home" });
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    await removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    // Redirect to the login screen after logout
    router.replace({ pathname: "/(auth)/login" });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
