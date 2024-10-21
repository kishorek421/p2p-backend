import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { HStack } from '@/components/ui/hstack'
import { Card } from '@/components/ui/card';
import { Button, ButtonText } from '@/components/ui/button';
import api from '@/services/api';
import { router } from 'expo-router';

import { GET_USER_LIST } from '@/constants/api_endpoints';
import { UserDetailsModel } from '@/models/users';


const UsersList = () => {
  const [myUserList, setMyUserList] = useState<UserDetailsModel[]>([]);

  useEffect(() => {
    fetchuserDetails();

    function fetchuserDetails() {
      api.get(GET_USER_LIST).then((response) => {
        console.log(response.data.data);
        setMyUserList(response.data?.data?.content ?? []);
      });
    }
  

  }, []);
  return (
    <FlatList
      data={myUserList}
      renderItem={({ item }) => (
        <TouchableOpacity className='p-4'
          onPress={() => router.push({
            pathname: "/users/user_details/[userId]",
            params: {
              userId: item.id as string
            }
          })}
        >

          <Card className="p-0 rounded-xl">
            <HStack>
              <Image
                source={{ uri: "https://plus.unsplash.com/premium_photo-1661297414288-8ed17eb1b3f1?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }}
                width={130}
                height={220}
                className='rounded-s-xl'
              />

              <View className='px-4 py-3 gap-5 flex flex-1'>
                <View className='flex-row justify-between'>
                  <Text className='text-gray-500'>Name</Text>
                  <Text className='underline '>
                    {item.firstName ?? "-"} {item.lastName ?? ""}
                  </Text>
                </View>
                
                <View className='flex-row justify-between'>
                  <Text className='text-gray-500'>DOJ</Text>
                  <Text>{item.dateOfJoining ?? "-"}</Text>
                </View>
                <View className='flex-row justify-between'>
                  <Text className='text-gray-500'>Designation</Text>
                  <Text>{item.designationDetails?.name ?? "-"}</Text>
                </View>
                <View className='flex-row justify-between'>
                  <Text className='text-gray-500'>Department</Text>
                  <Text className=''>{item.departmentDetails?.name ?? "-"}</Text>
                </View>
                <View>
                  <Button>
                    <ButtonText>Active</ButtonText>
                  </Button>
                </View>
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


export default UsersList;
