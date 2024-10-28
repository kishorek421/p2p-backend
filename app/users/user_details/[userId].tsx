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

const UserDetails = () => {
  const { userId } = useLocalSearchParams();

  const [assignedDevicesList, setAssignedDevicesList] = useState<
    AssetMasterListItemModel[]
  >([]);

  const [userDetails, setUserDetails] = useState<UserDetailsModel>({});

  useEffect(() => {
    fetchUserDetails();

    function fetchUserDetails() {
      const params = `?userId=${userId}`;

      api.get(GET_USER_DETAILS + params).then((response) => {
        setUserDetails(response.data?.data ?? {});
        fetchUserDevices();
      });
    }

    const fetchUserDevices = () => {
      api.get(GET_ASSETS_LIST_BY_USER_ID).then((response) => {
        console.log(response.data.data);
        setAssignedDevicesList(response.data?.data?.content ?? []);
      });
    };
  }, [userId]);

  return (
    <View className="p-4">
      <Card className="p-0">
        <View className="flex">
          <Image
            source={{
              uri: "https://plus.unsplash.com/premium_photo-1661297414288-8ed17eb1b3f1?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            }}
            style={{ height: 150 }}
            className=""
          />

          <View className="flex px-4 py-3 gap-5">
            <View
              className={`${userDetails.statusDetails?.key === "ACTIVE" ? "bg-primary-950" : "bg-secondary-950"} px-2 py-3 rounded-lg`}
            >
              <Text className="text-white text-center font-semibold">
                Active
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Name</Text>
              <Text className="underline">
                {" "}
                {userDetails.firstName ?? "-"} {userDetails.lastName ?? ""}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Mobile</Text>
              <Text>{userDetails.mobile ?? "-"}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-500">User Type</Text>
              <Text>{userDetails.userTypeDetails?.value ?? "-"}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Organization</Text>
              <Text>{userDetails.orgDetails?.name ?? "-"}</Text>
            </View>
          </View>
        </View>
      </Card>
      <View className="mt-6">
        <Text className="font-extrabold text-lg">Assigned Assets</Text>
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
