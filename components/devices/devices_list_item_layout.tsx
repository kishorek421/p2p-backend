import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { router } from 'expo-router'
import Feather from 'react-native-vector-icons/Feather'
import { Button, ButtonText } from '../ui/button'
import { Card } from '../ui/card'
import { HStack } from '../ui/hstack'
import { getDeviceStatusColor } from '@/utils/helper'
import { AssetMasterListItemModel } from '@/models/assets'

interface DevicesListItemLayoutProps {
  data: AssetMasterListItemModel;
}

const DevicesListItemLayout = ({
  data,
} : DevicesListItemLayoutProps) => {
  return (
    <TouchableOpacity className='p-4'
      onPress={() => router.push({
        pathname: "/devices/device_details/[deviceId]",
        params: {
          deviceId: data.id as string
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
                {data.assetModelDetails?.modelName ?? "-"}
              </Text>
            </View>
            <View className='flex-row justify-between '>
              <Text className='text-gray-500 text-[16px]'>Serial No</Text>
              <Text className=''>
                {data.serialNo ?? "-"}
              </Text>
            </View>
            <View className='flex-row justify-between '>
              <Text className='text-gray-500 text-[16px]'>As Warranty</Text>
              <Text className=''>
                {(data.asWarranty ?? false) ? "Yes" : "No"}
              </Text>
            </View>
            <View className='flex-row justify-between items-center '>
              <Text className='text-gray-500 text-[16px]'>Status</Text>
              <View className={`px-4 py-2 rounded-md ${getDeviceStatusColor(data.assetStatusDetails?.key)}`}>
                <Text className={`font-medium ${getDeviceStatusColor(data.assetStatusDetails?.key)}`}>
                  {data.assetStatusDetails?.value ?? "-"}
                </Text>
              </View>
            </View>
            <Button className='bg-primary-950 rounded-lg flex'>
              <ButtonText className='w-full text-center'>Raise Ticket</ButtonText>
              <Feather name="external-link" className='ms-2' size={20} color="white" />
            </Button>
          </View>
        </HStack>
      </Card>
    </TouchableOpacity>
  )
}

export default DevicesListItemLayout