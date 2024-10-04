import { FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import api from '@/services/api';
import { GET_ASSET_MASTERS_LIST } from '@/constants/api_endpoints';
import { AssetMasterListItemModel } from '@/models/assets';
import DevicesListItemLayout from '@/components/devices/devices_list_item_layout';

const DevicesList = () => {

  const [myDevicesList, setMyDevicesList] = useState<AssetMasterListItemModel[]>([]);

  useEffect(() => {
    fetchMyDevices();
  }, []);

  const fetchMyDevices = () => {
    api.get(GET_ASSET_MASTERS_LIST).then((response) => {
      console.log(response.data.data);
      setMyDevicesList(response.data?.data?.content ?? []);
    })
  }

  // normal function
  // function func_name() {return;}
  // arrow function
  // const getColor = () => { return;}
  // const getColor = (para

  return (
    <FlatList
      data={myDevicesList}
      renderItem={({ item }) => (
        <DevicesListItemLayout data={item}/>
      )}
      keyExtractor={(_, index) => index.toString()}
      onEndReached={() => {

      }}
    />
  )
}

export default DevicesList