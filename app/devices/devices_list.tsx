import { FlatList, View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { GET_ASSET_MASTERS_LIST } from "@/constants/api_endpoints";
import { AssetMasterListItemModel } from "@/models/assets";
import DevicesListItemLayout from "@/components/devices/devices_list_item_layout";

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
      renderItem={({ item }) => <DevicesListItemLayout data={item} />}
      keyExtractor={(_, index) => index.toString()}
      onEndReached={() => {}}
    />
  );
};

export default DevicesList;
