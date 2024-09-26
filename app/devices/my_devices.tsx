import { View, Text, FlatList, Image, TouchableHighlight, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Button, ButtonText } from '@/components/ui/button'
import api from '@/services/api';
import { GET_ASSET_MASTERS_LIST } from '@/constants/api_endpoints';
import { AssetMasterListItemModel } from '@/models/assets';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';


const MyDevices = () => {

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

  const getColor = (status?: string) => {
    switch (status) {
      case "IN_USE":
        return "text-primary-900 bg-primary-200 "
      case "NOT_IN_USE":
        return "text-red-500 bg-red-200"
      default: return "text-grey-500"
    }
  }

  // normal function
  // function func_name() {return;}
  // arrow function
  // const getColor = () => { return;}
  // const getColor = (param) => ();
  // anonymous function
  // () => {return;}
  // () => (return_value);

  // const onMyDeviceItemPress = () => {
  //   router.push();
  // }


  return (
    <FlatList
      data={myDevicesList}
      renderItem={({ item }) => (
        <TouchableOpacity className='p-4'
          onPress={() => router.push({
            pathname: "/devices/device_details/[deviceId]",
            params: {
              deviceId: item.id as string
            }
          })}
        >
          <Card className='p-0 rounded-xl'>
            <HStack>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }}
                width={130}
                height={220}
                className='rounded-s-xl'
              />
              <View className='flex flex-1 px-4 py-3 gap-5'>
                <View className='flex-row justify-between'>
                  <Text className='text-gray-500 text-[16px]'>Model</Text>
                  <Text className='underline text-primary-950 font-semibold text-[16px]'>
                    {item.assetModelDetails?.modelName ?? "-"}
                  </Text>
                </View>
                <View className='flex-row justify-between '>
                  <Text className='text-gray-500 text-[16px]'>Serial No</Text>
                  <Text className=''>
                    {item.serialNo ?? "-"}
                  </Text>
                </View>
                <View className='flex-row justify-between '>
                  <Text className='text-gray-500 text-[16px]'>As Warranty</Text>
                  <Text className=''>
                    {(item.asWarranty ?? false) ? "Yes" : "No"}
                  </Text>
                </View>
                <View className='flex-row justify-between items-center '>
                  <Text className='text-gray-500 text-[16px]'>Status</Text>
                  <View className={`px-4 py-2 rounded-md ${getColor(item.assetStatusDetails?.key)}`}>
                    <Text className={`font-medium ${getColor(item.assetStatusDetails?.key)}`}>
                      {item.assetStatusDetails?.value ?? "-"}
                    </Text>
                  </View>
                </View>
                <Button className='bg-primary-950 rounded-lg flex'>
                  <ButtonText className='w-full text-center'>Raise Ticket   </ButtonText>
                  <Feather name="external-link" className='ms-2' size={20} color="white" />
                </Button>
              </View>
            </HStack>
          </Card>
        </TouchableOpacity>

      )}
      keyExtractor={(_, index) => index.toString()}
      onEndReached={() => {

      }}
    />
  )
}

export default MyDevices