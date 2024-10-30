import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "expo-router";
import {
  AUTH_TOKEN_KEY,
  CUSTOMER_LEAD_ID,
  IS_LEAD,
  IS_WELCOMED,
} from "@/constants/storage_keys";
import { getItem, removeItem } from "@/utils/secure_store";
import { ThemeProvider } from "@react-navigation/native";
import { GET_CUSTOMER_DETAILS } from "@/constants/api_endpoints";
import api from "@/services/api";
import { CustomerDetailsModel } from "@/models/customers";

interface AuthContextProps {
  user: CustomerDetailsModel | undefined;
  loading: boolean;
  logout: any;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined,
);

interface AuthProviderProps {
  children?: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<CustomerDetailsModel | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      // router.replace({ pathname: "/route/map_view_screen" });
      const token = await getItem(AUTH_TOKEN_KEY);
      console.log("token", token);
      if (token) {
        const isLead = await getItem(IS_LEAD);
        if (isLead === undefined) {
          router.replace({ pathname: "/(auth)/login" });
        } else if (isLead === "true") {
          const customerLeadId = await getItem(CUSTOMER_LEAD_ID);
          if (customerLeadId) {
            router.replace({
              pathname: "/(auth)/registration/[customerLeadId]",
              params: {
                customerLeadId: customerLeadId,
              },
            });
          } else {
            router.replace({ pathname: "/(auth)/login" });
          }
        } else {
          try {
            const response = await api.get(GET_CUSTOMER_DETAILS); // Replace with your own endpoint
            setUser(response.data);
          } catch (error) {
            console.error("Failed to fetch user:", error);
          }
          router.replace({ pathname: "/(root)/home" });
        }
      } else {
        const isWelcomed = await getItem(IS_WELCOMED);
        console.log("isWelcomed", isWelcomed);
        if (isWelcomed === "true") {
          router.replace({ pathname: "/(auth)/login" });
        } else {
          router.replace({ pathname: "/welcome" });
        }
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
    setUser(undefined);
    // Redirect to the login screen after logout
    router.replace({ pathname: "/(auth)/login" });
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
