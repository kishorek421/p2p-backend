import { FlatList, View, Text, Image } from "react-native";
import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { GET_ASSET_MASTERS_LIST } from "@/constants/api_endpoints";
import { AssetMasterListItemModel } from "@/models/assets";
import { getDeviceStatusColor } from "@/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";

const DevicesList = () => {
  const [devicesList, setDevicesList] = useState<AssetMasterListItemModel[]>(
    [],
  );

  useEffect(() => {
    fetchMyDevices();
  }, []);

  const fetchMyDevices = () => {
    api.get(GET_ASSET_MASTERS_LIST).then((response) => {
      console.log(response.data.data);
      setDevicesList(response.data?.data?.content ?? []);
    });
  };

  return devicesList.length === 0 ? (
    <View className="w-full h-full flex justify-center items-center">
      <Text className="text-gray-500">No Devices Found</Text>
    </View>
  ) : (
    <FlatList
      data={devicesList}
      renderItem={({ item }) => (
        // <DeviceListItemLayout data={item} />
        <View className="px-4 mt-4">
          <View className="w-full bg-white px-3 py-3 rounded-lg shadow-sm">
            <View className="flex">
              <View className="w-full ">
                <View className="flex-row items-center justify-between">
                  <View className="flex">
                    <Text className="text-gray-500 text-md">Serial No.</Text>
                    <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                      {item.serialNo ?? "-"}
                    </Text>
                  </View>
                  <View className="flex items-end">
                    <Text className="text-gray-500 text-md">Asset Type</Text>
                    <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                      {item.assetTypeDetails?.name ?? "-"}
                    </Text>
                  </View>
                </View>
              </View>
              {/* <View className="w-full mt-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex">
                    <Text className="text-gray-500 text-md">Model Name</Text>
                    <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                      {item.assetModelDetails?.modelName ?? "-"}
                    </Text>
                  </View>
                  <View className="flex items-end">
                    <Text className="text-gray-500 text-md">Model Number</Text>
                    <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                      {item.assetModelDetails?.modelNumber ?? "-"}
                    </Text>
                  </View>
                </View>
              </View> */}
              <View className="w-full mt-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex">
                    <Text className="text-gray-500 text-md">
                      Unique Identifier
                    </Text>
                    <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                      {item.uniqueIdentifier ?? "-"}
                    </Text>
                  </View>
                  <View className="flex">
                    <Text className="text-gray-500 text-md ">Asset Status</Text>
                    <View
                      className={`mt-1 flex-row justify-center py-2 rounded-md ${getDeviceStatusColor(item.assetStatusDetails?.key)}`}
                    >
                      <Text
                        className={`font-medium ${getDeviceStatusColor(item.assetStatusDetails?.key)}`}
                      >
                        {item.assetStatusDetails?.value ?? "-"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View className="border-[.5px] border-gray-300 h-[1px] mt-3 mb-3 w-full" />
              <View className="w-full">
                <View className="flex-row items-center justify-between">
                  <View className="flex">
                    <Text className="text-gray-500 text-md ">
                      Raised Tickets
                    </Text>
                    <Text className="text-md text-gray-900 font-semibold ">
                      11
                    </Text>
                  </View>
                  <View className="flex items-end">
                    <Text className="text-gray-500 text-md ">
                      Last Ticket Status
                    </Text>
                    <Text className="text-md text-gray-900 font-semibold ">
                      Raised
                    </Text>
                    {/* <View className="mt-1">
                      <TicketStatusComponent
                        statusKey={"RAISED"}
                        statusValue={"Raised"}
                      />
                    </View> */}
                  </View>
                </View>
              </View>

              <View className=" border-[.5px] border-gray-300 h-[1px] mt-3 mb-3 w-full" />
              <View className="flex-row justify-between w-full items-center">
                <View className="flex-row items-center">
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1445053023192-8d45cb66099d?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    }}
                    width={35}
                    height={35}
                    className="rounded-full"
                  />
                  <View className="ms-2">
                    <Text className="text-gray-500 text-[13px] mt-[1px]">
                      Assigned To
                    </Text>
                    <Text className="font-bold ">Dharani Shree</Text>
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
                    28-08-24
                  </Text>
                </View>
                {/* <View className="flex items-end  ">
                  <Text className="text-gray-500 text-[13px]">Status</Text>
                  <View
                    className={`px-4 py-2 rounded-md ${getDeviceStatusColor(item.assetStatusDetails?.key)}`}
                  >
                    <Text
                      className={`font-medium ${getDeviceStatusColor(item.assetStatusDetails?.key)}`}
                    >
                      {item.assetStatusDetails?.value ?? "-"}
                    </Text>
                  </View>
                </View> */}
              </View>
              <View className="flex-row bg-secondary-950 p-3 justify-center items-center rounded-md mt-4">
                <Ionicons
                  name="ticket-outline"
                  size={20}
                  color="white"
                  className="me-2"
                />
                <Text className="text-white font-semibold">Raise Ticket</Text>
              </View>
            </View>
          </View>
        </View>
      )}
      keyExtractor={(_, index) => index.toString()}
      onEndReached={() => {}}
    />
  );
};

export default DevicesList;
