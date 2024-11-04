import { FlatList, View, Text, Image } from "react-native";
import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { GET_ASSET_MASTERS_LIST } from "@/constants/api_endpoints";
import { AssetMasterListItemModel } from "@/models/assets";
import DeviceListItemLayout from "@/components/devices/DeviceListItemLayout";

const DevicesList = () => {
  const [devicesList, setDevicesList] = useState<AssetMasterListItemModel[]>(
    [],
  );

  useEffect(() => {
    fetchMyDevices();
  }, []);

  const fetchMyDevices = () => {
    api.get(GET_ASSET_MASTERS_LIST).then((response) => {
      console.log("devices list ----->", response.data.data);
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
      renderItem={({ item }) => <DeviceListItemLayout data={item} />}
      keyExtractor={(_, index) => index.toString()}
      onEndReached={() => {}}
    />
  );
};

export default DevicesList;
