import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="home"
        options={{ title: "Home", headerShown: false }}
      />
      <Stack.Screen
        name="tickets_history/[customerId]"
        options={{ title: "Tickets History" }}
      />
      <Stack.Screen
        name="raise_ticket/[customerId]"
        options={{ title: "Raise Ticket", headerBackTitle: "Back" }}
      />
    </Stack>
  );
};

export default Layout;
