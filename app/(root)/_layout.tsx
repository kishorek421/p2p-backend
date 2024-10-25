import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";

import Icon from "react-native-vector-icons/AntDesign";
import { Image, TouchableOpacity } from "react-native";
import CustomDrawerContent from "@/components/home/CustomDrawerContent";
import useAuth from "@/hooks/useAuth";

const Layout = () => {
  const { user } = useAuth();
  return (
    // <Stack>
    //   <Stack.Screen
    //     name="home"
    //     options={{ title: "Home", headerShown: false }}
    //   />
    //   <Stack.Screen
    //     name="tickets_history/[customerId]"
    //     options={{ title: "Tickets History" }}
    //   />
    //   <Stack.Screen
    //     name="raise_ticket/[customerId]"
    //     options={{ title: "Raise Ticket", headerBackTitle: "Back" }}
    //   />
    // </Stack>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={(props) => ({
          headerStyle: {
            backgroundColor: "#f2f2f2",
            shadowColor: "#f2f2f2",
          },
          headerLeft: (_) => (
            <TouchableOpacity
              onPress={() => {
                props.navigation?.openDrawer();
              }}
            >
              <Icon name="bars" size={26} className="ps-3" />
            </TouchableOpacity>
          ),
          // headerRight: (_) => <TouchableOpacity>
          //   <Image source={{uri: user}} />
          // </TouchableOpacity>,
        })}
      >
        <Drawer.Screen
          name="home"
          options={{ title: "Home", headerTitle: "" }}
        />
        {/* <Drawer.Screen
          name="tickets_history/[customerId]"
          options={{ title: "Tickets History", drawerItemStyle: { height: 0 } }}
        />
        <Drawer.Screen
          name="raise_ticket/[customerId]"
          options={{ title: "Raise Ticket", drawerItemStyle: { height: 0 } }}
        />
        <Drawer.Screen
          name="ticket_history_details/[ticketId]"
          options={{ title: "Ticket Details", drawerItemStyle: { height: 0 } }}
        /> */}
      </Drawer>
    </GestureHandlerRootView>
  );
};

export default Layout;
