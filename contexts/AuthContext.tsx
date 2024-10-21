import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "expo-router";
import { AUTH_TOKEN_KEY } from "@/constants/storage_keys";
import { getItem, removeItem } from "@/utils/secure_store";
import { ThemeProvider } from "@react-navigation/native";

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
      // router.replace({ pathname: "/route/map_view_screen" });
      const token = await getItem(AUTH_TOKEN_KEY);
      if (token) {
        // try {
        //   const response = await api.get(GET_CUSTOMER_LEAD_DETAILS); // Replace with your own endpoint
        //   setUser(response.data);
        // } catch (error) {
        //   console.error("Failed to fetch user:", error);
        // }
        router.replace({ pathname: "/(root)/home" });
      } else {
        logout();
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // const login = async (email: string, password: string) => {
  //   try {
  //     const response = await api.post(LOGIN, { email, password });
  //     await setItem(AUTH_TOKEN_KEY, response.data.token);
  //     setUser(response.data.user);
  //     // Redirect to the home screen after login
  //     router.replace({ pathname: "./home" });
  //   } catch (error) {
  //     console.error("Login failed:", error);
  //     throw error;
  //   }
  // };

  const logout = async () => {
    await removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    // Redirect to the login screen after logout
    // router.replace({ pathname: "/(auth)/login" });
    router.replace({ pathname: "/users/create_user" });
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      <ThemeProvider
        value={{
          dark: false,
          colors: {
            primary: "#009c68",
            background: "#f2f2f2",
            card: "#fff",
            text: "#000",
            border: "",
            notification: "",
          },
        }}
      >
        {children}
      </ThemeProvider>
    </AuthContext.Provider>
  );
};
