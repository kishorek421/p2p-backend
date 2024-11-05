import {
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { VStack } from "@/components/ui/vstack";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import React, { useEffect, useState } from "react";
import { Button, ButtonText } from "@/components/ui/button";
import Icon from "react-native-vector-icons/AntDesign";
import RecentTicketHistoryLayout from "@/components/common/RecentTicketHistoryLayout";
import { CustomerDetailsModel } from "@/models/customers";
import { router } from "expo-router";
import { ServiceItemModel } from "@/models/ui/service_item_model";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RoleModel, RoleModulePermissionsModel } from "@/models/rbac";
import { UserDetailsModel } from "@/models/users";

const ContentLayout = ({
  customerDetails,
  authorizedModules,
  roleDetails,
}: {
  customerDetails: UserDetailsModel;
  authorizedModules: RoleModulePermissionsModel[];
  roleDetails: RoleModel;
}) => {
  let [serviceTabs, setServiceTabs] = useState<ServiceItemModel[]>([
    {
      label: "Devices",
      icon: <AntDesign name="laptop" size={20} color="#39a676" />,
      path: "/devices/devices_list",
      code: "DEVICES",
    },
    {
      label: " Users",
      icon: <AntDesign name="laptop" size={20} color="#39a676" />,
      path: "/users/users_list",
      code: "USERS",
    },
  ]);

  useEffect(() => {
    if (customerDetails.id) {
      let isTicketTabExist = false;
      for (const tabs of serviceTabs) {
        if (tabs.code === "TICKETS") {
          isTicketTabExist = true;
          break;
        }
      }
      if (!isTicketTabExist) {
        setServiceTabs((prev) => {
          prev.push({
            label: "Tickets",
            icon: <Ionicons name="ticket-outline" size={20} color="#39a676" />,
            path: "/tickets/tickets_history/list/[customerId]",
            params: {
              customerId: customerDetails.id ?? "",
            },
            code: "TICKETS",
          });
          return prev;
        });
      }
    }
  }, [customerDetails]);

  useEffect(() => {
    const userTypeKey = customerDetails?.userTypeDetails?.key;

    if (
      userTypeKey !== undefined &&
      customerDetails?.userTypeDetails?.key !== "CUSTOMER"
    ) {
      const unauthorizedTabIndexes = ["DEVICES", "USERS"];
      setServiceTabs((prev) => {
        return [
          ...prev.filter(
            (tab) => !unauthorizedTabIndexes.includes(tab.code ?? ""),
          ),
        ];
      });
    }
  }, [roleDetails]);

  return (
    <VStack className="mt-2">
      <View className="px-4">
        <Text className="text-2xl font-bold">
          Hello{" "}
          <Text className="color-primary-950">
            {customerDetails.firstName ?? ""} {customerDetails.lastName ?? ""}{" "}
            👋
          </Text>
        </Text>
        <Text className="color-gray-500 mt-1 text-md">
          Ensure quick resolutions for your team’s IT issues.
        </Text>
        <View className="mt-6 ps-4 pe-0 rounded-2xl bg-white">
          <View className="flex-row justify-between items-end">
            <VStack className="w-44 justify-evenly my-3">
              <VStack>
                <Text className="text-2xl font-medium">
                  Having trouble with your
                  <Text className="text-primary-950"> Device?</Text>
                </Text>
              </VStack>
              <Button
                className="mb-4 mt-4 bg-gray-900 rounded-lg"
                onPress={() =>
                  router.push({
                    pathname: "/tickets/raise_ticket/[customerId]",
                    params: {
                      customerId: customerDetails.id ?? "",
                    },
                  })
                }
              >
                <ButtonText>Raise Ticket</ButtonText>
                <Icon
                  name="arrowright"
                  className="ms-3"
                  color="white"
                  size={20}
                />
              </Button>
            </VStack>
            <Image
              source={require("../../assets/images/card_man.png")}
              className="w-[150px] h-[150px] me-4"
            />
          </View>
        </View>
        <VStack className="mt-4">
          <Text className="text-[16px] font-bold">Quick Actions</Text>
          <FlatList
            className="mt-2"
            data={serviceTabs}
            numColumns={3}
            renderItem={(item) => {
              const icon: any = item.item.icon;
              return (
                <TouchableOpacity
                  onPress={() => {
                    const path: any = item.item.path;
                    if (path) {
                      router.push({
                        pathname: path,
                        params: item.item.params ?? {},
                      });
                    }
                  }}
                >
                  <View className="px-2 py-3 bg-white my-2 me-5 rounded-lg flex justify-center items-center gap-2 w-28">
                    <View className=" w-10 h-10 p-1 bg-primary-100 rounded-full flex justify-center items-center ">
                      {icon}
                    </View>
                    <Text className="text-primary-900 font-semibold text-sm">
                      {item.item.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </VStack>
        <HStack className="justify-between mt-2">
          <View className="flex-row items-center">
            <Text className="text-[16px] font-bold">Recent Tickets</Text>
            <Ionicons
              name="ticket-outline"
              size={20}
              color="black"
              className="ms-2"
            />
          </View>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/tickets/tickets_history/list/[customerId]",
                params: {
                  customerId: customerDetails.id ?? "",
                },
              })
            }
          >
            <Text className="text-sm underline color-primary-950 font-medium">
              Show All
            </Text>
          </Pressable>
        </HStack>
      </View>
      <View className="mt-2">
        <RecentTicketHistoryLayout placing="home" />
      </View>
    </VStack>
  );
};

export default ContentLayout;
