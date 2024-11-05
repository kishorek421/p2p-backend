import { View, Text, Image, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useLocalSearchParams } from "expo-router";
import {
  GET_ASSETS_LIST_BY_USER_ID,
  GET_USER_DETAILS,
} from "@/constants/api_endpoints";
import { UserDetailsModel } from "@/models/users";
import api from "@/services/api";
import { AssetMasterListItemModel } from "@/models/assets";
import DeviceListItemLayout from "@/components/devices/DeviceListItemLayout";
import Feather from "@expo/vector-icons/Feather";

const UserDetails = () => {
  const { userId } = useLocalSearchParams();

  const [assignedDevicesList, setAssignedDevicesList] = useState<
    AssetMasterListItemModel[]
  >([]);

  const [userDetails, setUserDetails] = useState<UserDetailsModel>({});

  useEffect(() => {
    const fetchUserDetails = () => {
      const params = `?userId=${userId}`;

      api
        .get(GET_USER_DETAILS + params)
        .then((response) => {
          setUserDetails(response.data?.data ?? {});
          fetchUserDevices();
        })
        .catch((e) => {
          console.error(e);
          setUserDetails({});
        });
    };

    const fetchUserDevices = () => {
      api
        .get(GET_ASSETS_LIST_BY_USER_ID)
        .then((response) => {
          console.log("devicesList ~~~~~~~~~~~~~~~~~>", response.data.data);
          setAssignedDevicesList(response.data?.data?.content ?? []);
        })
        .catch((e) => {
          console.error(e);
          setAssignedDevicesList([]);
        });
    };

    fetchUserDetails();
  }, [userId]);

  return (
    <View className="p-4 bg-white h-full ">
      <View className="flex rounded-lg  shadow-sm p-4 bg-white">
        <View className="flex-row justify-between w-full">
          <View className="flex-row items-center">
            {/* <Image
              source={{
                uri: "https://images.unsplash.com/photo-1445053023192-8d45cb66099d?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              }}
              width={35}
              height={35}
              className="rounded-full"
            /> */}
            <View className="bg-gray-100 p-2 rounded-full">
              <Feather name="user" size={24} color="#9ca3af" />
            </View>
            <View className="ms-2">
              <Text className="font-bold">
                {userDetails.firstName ?? "-"} {userDetails.lastName ?? ""}
              </Text>
              <Text className="text-gray-500 text-[13px] mt-[1px]">
                {userDetails.mobile ?? "-"}
              </Text>
            </View>
          </View>
          <View>
            <View
              className={`${userDetails.statusDetails?.key === "ACTIVE" ? "bg-primary-200" : "bg-red-100"} px-4 py-3 rounded-lg`}
            >
              <Text
                className={`${userDetails.statusDetails?.key === "ACTIVE" ? "text-primary-950" : "text-red-500"} text-center font-semibold`}
              >
                Active
              </Text>
            </View>
          </View>
        </View>
        <View className="w-full mt-3">
          <View className="flex-row items-center justify-between">
            <View className="flex">
              <Text className="text-gray-500 text-md ">Department</Text>
              <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                {userDetails.orgDepartmentDetails?.name ?? "-"}
              </Text>
            </View>
            <View className="flex items-end">
              <Text className="text-gray-500 text-md ">Designation</Text>
              <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                {userDetails.orgDesignationDetails?.name ?? "-"}
              </Text>
            </View>
          </View>
        </View>
        <View className="w-full mt-3">
          <View className="flex-row items-center justify-between">
            <View className="flex">
              <Text className="text-gray-500 text-md ">Work Location</Text>
              <Text className="text-md text-gray-900 font-semibold mt-[2px]">
                {userDetails.orgDetails?.cityDetails?.cityName ?? "-"}
              </Text>
            </View>
            <View className="flex items-end">
              <Text className="text-gray-500 text-md ">Last Ticket Status</Text>
              <Text className="text-md text-gray-900 font-semibold mt-[2px]">
                {userDetails.ticketDetails?.lastTicketStatus ?? "-"}
              </Text>
            </View>
          </View>
        </View>
        <View className="border-dashed border-[1px] border-gray-300 h-[1px] mt-3 mb-3 w-full" />
        <View className="w-full">
          <View className="flex-row items-center justify-between">
            <View className="flex">
              <Text className="text-gray-500 text-md ">Raised Tickets</Text>
              <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                {userDetails.ticketDetails?.raisedTicketCount ?? "-"}
              </Text>
            </View>
            <View className="flex items-end">
              <Text className="text-gray-500 text-md ">Resolved Tickets</Text>
              <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                {userDetails.ticketDetails?.closedTicketCount ?? "-"}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View className="mt-6">
        <Text className="text-[16px] font-bold">Assigned Assets</Text>
      </View>
      <View>
        {assignedDevicesList.length === 0 ? (
          <View className="bg-gray-200 w-full h-36 flex justify-center items-center mt-2 rounded-lg">
            <Text className="text-gray-500">No Devices Assigned</Text>
          </View>
        ) : (
          <FlatList
            data={assignedDevicesList}
            renderItem={({ item }) => <DeviceListItemLayout data={item} />}
            keyExtractor={(_, index) => index.toString()}
            onEndReached={() => {}}
          />
        )}
      </View>
    </View>
  );
};

export default UserDetails;
