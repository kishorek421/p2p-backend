import { FlatList, View, Text, Image } from "react-native";
import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { GET_ASSET_MASTERS_LIST } from "@/constants/api_endpoints";
import { AssetMasterListItemModel } from "@/models/assets";
import DeviceListItemLayout from "@/components/devices/DeviceListItemLayout";
import useRefresh from "@/hooks/useRefresh";

const DevicesList = () => {
  const [devicesList, setDevicesList] = useState<AssetMasterListItemModel[]>(
    [],
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const { refreshFlag, setRefreshFlag } = useRefresh();

  useEffect(() => {
    setDevicesList([]);
    fetchMyDevices(1);
  }, []);

  useEffect(() => {
    setDevicesList([]);
    if (refreshFlag) {
      fetchMyDevices(1);
    }
  }, [refreshFlag]);

  const fetchMyDevices = (nextPageNumber: number) => {
    api
      .get(GET_ASSET_MASTERS_LIST, {
        params: {
          pageNo: nextPageNumber,
          pageSize: 10,
        },
      })
      .then((response) => {
        let content = response.data?.data?.content ?? [];
        if (nextPageNumber === 1) {
          setDevicesList(content);
        } else {
          setDevicesList((prevState) => [...prevState, ...content]);
        }
        let paginator = response.data?.data?.paginator;
        if (paginator) {
          let iCurrentPage = paginator.currentPage;
          let iLastPage = paginator.lastPage;
          if (iCurrentPage && iLastPage !== undefined) {
            setCurrentPage(iCurrentPage);
            setIsLastPage(iLastPage);
          }
        }
        setRefreshFlag(false);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return devicesList.length === 0 ? (
    <View className="w-full h-full flex justify-center items-center">
      <Text className="text-gray-500">No Devices Found</Text>
    </View>
  ) : (
    <View className="pt-2 bg-white">
      <FlatList
        data={devicesList}
        renderItem={({ item }) => <DeviceListItemLayout data={item} />}
        keyExtractor={(_, index) => index.toString()}
        onEndReached={() => {
          if (!isLastPage) {
            fetchMyDevices(currentPage + 1);
          }
        }}
        ListFooterComponent={<View style={{ height: 30 }} />}
      />
    </View>
  );
};

export default DevicesList;
