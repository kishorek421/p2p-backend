import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card';
import { Button, ButtonText } from '@/components/ui/button'
import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams } from 'expo-router';
import api from "@/services/api";
import { GET_ASSET_DETAILS } from '@/constants/api_endpoints';
import { AssetMasterListItemModel } from '@/models/assets';


const DeviceDetailsScreen = () => {
    const { deviceId } = useLocalSearchParams();

    const [deviceDetails, setDeviceDetails] = useState<AssetMasterListItemModel>({});
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
    return (
        
        <View className='p-4' >
            <Card className='p-3'>
                <View>
                    <Button className='bg-primary-950 rounded-lg flex h-12'>
                        <ButtonText className='w-full text-center'>Raise Ticket</ButtonText>
                        <Feather name="external-link" className='ms-2' size={20} color="white" />
                    </Button>

                    <View className='mt-4 mb-4 flex gap-4'>
                        <View className='flex-row justify-between'>
                            <View className='flex'>
                                <Text className='text-gray-500 text-[16px] '>Model</Text>
                                <Text className='underline text-primary-950 font-semibold text-[16px] '>{deviceDetails.assetModelDetails?.modelName}</Text>
                            </View>
                            <View className='flex justify-end items-end'>
                                <Text className='text-gray-500 text-[16px]'>Serial No</Text>
                                <Text className='text-[16px] font-semibold'>{deviceDetails.serialNo}</Text>
                            </View>
                        </View>
                        <View className='flex-row justify-between'>
                            <View className='flex'>
                                <Text className='text-gray-500 text-[16px]'>Status</Text>
                                <View className={`px-4 py-2 rounded-md ${getColor(deviceDetails.assetStatusDetails?.key)}`}>
                                    <Text className={`font-medium pd-4 ${getColor(deviceDetails.assetStatusDetails?.key)}`}>
                                        {deviceDetails.assetStatusDetails?.value ?? "-"}
                                    </Text>
                                </View>
                            </View>
                            <View className='flex justify-end items-end'>
                                <Text className='text-gray-500 text-[16px]'>As Warranty</Text>
                                <Text className=''>
                                    {(deviceDetails.asWarranty ?? false) ? "Yes" : "No"}
                                </Text>
                            </View>
                        </View>

                    </View>
                </View>
            </Card>
        </View>
    )
}

export default DeviceDetailsScreen

function setIsLoading(arg0: boolean) {
    throw new Error('Function not implemented.');
}
function setAssetModel(arg0: any) {
    throw new Error('Function not implemented.');
}

