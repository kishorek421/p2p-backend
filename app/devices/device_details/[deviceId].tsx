import { View, Text, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import api from "@/services/api";
import { GET_ASSET_DETAILS } from "@/constants/api_endpoints";
import { AssetMasterListItemModel } from "@/models/assets";
import { getDeviceStatusColor } from "@/utils/helper";
import Feather from "@expo/vector-icons/Feather";
import moment from "moment";

const DeviceDetailsScreen = () => {
  const { deviceId } = useLocalSearchParams();

  const [deviceDetails, setDeviceDetails] = useState<AssetMasterListItemModel>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeviceDetailsById();
  }, []);

  const fetchDeviceDetailsById = () => {
    api
      .get(GET_ASSET_DETAILS + `?assetMasterId=${deviceId}`)
      .then((response) => {
        setIsLoading(false);
        setDeviceDetails(response.data.data ?? {});
      })
      .catch((e) => {
        console.error(e);
        setIsLoading(false);
      });
  };

  return (
    <View className="px-4 mt-4">
      <View className="w-full bg-white px-3 py-3 rounded-lg shadow-sm">
        <View className="flex">
          <View className="w-full ">
            <View className="flex-row items-center justify-between">
              <View className="flex">
                <Text className="text-gray-500 text-md">Serial No.</Text>
                <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                  {deviceDetails.serialNo ?? "-"}
                </Text>
              </View>
              <View className="flex items-end">
                <Text className="text-gray-500 text-md">Asset Type</Text>
                <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                  {deviceDetails.assetTypeDetails?.name ?? "-"}
                </Text>
              </View>
            </View>
          </View>
          <View className="w-full mt-3">
            <View className="flex-row items-center justify-between">
              <View className="flex">
                <Text className="text-gray-500 text-md">Model Name</Text>
                <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                  {deviceDetails.assetModelDetails?.modelName ?? "-"}
                </Text>
              </View>
              <View className="flex items-end">
                <Text className="text-gray-500 text-md">Model Number</Text>
                <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                  {deviceDetails.assetModelDetails?.modelNumber ?? "-"}
                </Text>
              </View>
            </View>
          </View>
          <View className="w-full mt-3">
            <View className="flex-row items-center justify-between">
              <View className="flex">
                <Text className="text-gray-500 text-md">Unique Identifier</Text>
                <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                  {deviceDetails.uniqueIdentifier ?? "-"}
                </Text>
              </View>
              <View className="flex">
                <Text className="text-gray-500 text-md ">Asset Status</Text>
                <View
                  className={`mt-1 flex-row justify-center py-2 rounded-md ${getDeviceStatusColor(deviceDetails.assetStatusDetails?.key)}`}
                >
                  <Text
                    className={`font-medium ${getDeviceStatusColor(deviceDetails.assetStatusDetails?.key)}`}
                  >
                    {deviceDetails.assetStatusDetails?.value ?? "-"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {/*
          <View className="border-[.5px] border-gray-300 h-[1px] mt-3 mb-3 w-full" />
           <View className="w-full">
            <View className="flex-row items-center justify-between">
              <View className="flex">
                <Text className="text-gray-500 text-md ">Raised Tickets</Text>
                <Text className="text-md text-gray-900 font-semibold ">11</Text>
              </View>
              <View className="flex items-end">
                <Text className="text-gray-500 text-md ">
                  Last Ticket Status
                </Text>
                <Text className="text-md text-gray-900 font-semibold ">
                  Raised
                </Text>
              </View>
            </View>
          </View> */}
          <View className=" border-[.5px] border-gray-300 h-[1px] mt-3 mb-3 w-full" />
          <View className="flex-row justify-between w-full items-center">
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
                <Text className="text-gray-500 text-[13px] mt-[1px]">
                  Assigned To
                </Text>
                <Text className="font-bold ">
                  {(deviceDetails.userAssignedToDetails?.firstName ?? "- ") +
                    (deviceDetails.userAssignedToDetails?.lastName ?? "")}
                </Text>
              </View>
            </View>
            <View className="ms-2 flex items-end">
              <Text className="text-gray-500 text-[13px] mt-[1px]">
                Assigned At
              </Text>
              <Text className="font-bold">
                {/* {item.createdAt
              ? moment(ticketModel.createdAt).fromNow()
              : "-"} */}
                {deviceDetails.userAssignedToDetails?.createdAt
                  ? moment(
                      deviceDetails.userAssignedToDetails?.createdAt,
                    ).format("DD-MM-YYYY")
                  : "-"}
              </Text>
            </View>
            {/* <View className="flex items-end  ">
            <Text className="text-gray-500 text-[13px]">Status</Text>
            <View
              className={`px-4 py-2 rounded-md ${getDeviceStatusColor(deviceDetails.assetStatusDetails?.key)}`}
            >
              <Text
                className={`font-medium ${getDeviceStatusColor(deviceDetails.assetStatusDetails?.key)}`}
              >
                {deviceDetails.assetStatusDetails?.value ?? "-"}
              </Text>
            </View>
          </View>  */}
          </View>
        </View>
      </View>
    </View>
  );
};

export default DeviceDetailsScreen;
