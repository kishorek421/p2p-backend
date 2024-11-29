import { AuthProvider } from "@/contexts/AuthContext";
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import { Pressable } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { RefreshProvider } from "@/contexts/RefreshContext";
import * as Sentry from "@sentry/react-native";
import React from "react";

Sentry.init({
  dsn: "https://9b8011450eb32dee8a2117d18cf8ba4f@o4508280019484672.ingest.us.sentry.io/4508280028004352",

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // enableSpotlight: __DEV__,
});
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GluestackUIProvider mode="light">
      <AutocompleteDropdownContextProvider>
        <AuthProvider>
          <RefreshProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen
                name="(root)"
                options={{ headerShown: false, headerTitle: "Home" }}
              />
              <Stack.Screen name="welcome" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
              {/* devices */}
              <Stack.Screen
                name="devices/devices_list"
                options={{
                  headerTitle: "All Devices",
                  headerBackTitle: "Home",
                  headerRight: () => {
                    return (
                      <Pressable
                        onPress={() => router.push("/devices/create_device")}
                      >
                        <AntDesign name="pluscircleo" size={20} color="black" />
                      </Pressable>
                    );
                  },
                }}
              />
              <Stack.Screen
                name="devices/device_details/[deviceId]"
                options={{ headerTitle: "Device Details" }}
              />
              <Stack.Screen
                name="devices/create_device"
                options={{ headerTitle: "Create Device" }}
              />
              {/* employees */}
              <Stack.Screen name="employees/employees_list" />
              <Stack.Screen name="employees/employee_details/[employeeId]" />
              {/* users */}
              <Stack.Screen
                name="users/create_user"
                options={{ headerTitle: "Create User" }}
              />
              <Stack.Screen
                name="users/users_list"
                options={{
                  headerTitle: "All Users",
                  headerBackTitle: "Home",
                  headerRight: () => {
                    return (
                      <Pressable
                        onPress={() => router.push("/users/create_user")}
                      >
                        <AntDesign name="pluscircleo" size={20} color="black" />
                      </Pressable>
                    );
                  },
                }}
              />
              <Stack.Screen
                name="users/user_details/[userId]"
                options={{ headerTitle: "User Details" }}
              />
              <Stack.Screen
                name="image_viewer/[uri]"
                options={{
                  presentation: "modal",
                  headerShown: false,
                }}
              />
              {/* tickets */}
              <Stack.Screen
                name="tickets/raise_ticket/[customerId]"
                options={{ headerTitle: "Raise Ticket", headerBackTitle: "" }}
              />
              <Stack.Screen
                name="tickets/tickets_history/list/[customerId]"
                options={{
                  headerTitle: "All Tickets",
                  headerBackTitle: "Home",
                }}
              />
              <Stack.Screen
                name="tickets/tickets_history/details/[ticketId]"
                options={{ headerTitle: "Ticket Details", headerBackTitle: "" }}
              />
            </Stack>
            <Toast />
          </RefreshProvider>
        </AuthProvider>
      </AutocompleteDropdownContextProvider>
    </GluestackUIProvider>
  );
}
