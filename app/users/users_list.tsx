import { View, Text, FlatList, Pressable, Image } from "react-native";
import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { router } from "expo-router";

import { GET_USERS_LIST } from "@/constants/api_endpoints";
import { UserDetailsModel } from "@/models/users";
import TicketStatusComponent from "@/components/tickets/TicketStatusComponent";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const UsersList = () => {
  const [usersList, setUsersList] = useState<UserDetailsModel[]>([]);

  useEffect(() => {
    fetchUsersList();

    function fetchUsersList() {
      api.get(GET_USERS_LIST).then((response) => {
        console.log(response.data.data);
        setUsersList(response.data?.data?.content ?? []);
      });
    }
  }, []);
  return (
    <View className="bg-white h-full">
      <View className="px-4 mt-3 w-auto">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <AntDesign name="filter" size={20} color="black"/>
            <Text className="font-semibold ms-1">Filter By</Text>
            {/* <FontAwesome6 name="filter" size={16} color="black" className="ms-1" /> */}
          </View>
          <View className="bg-gray-200 flex-row items-center py-1 px-2 rounded-lg">
            <AntDesign name="close" size={16} color="gray" />
            <Text className="text-sm ms-1 text-gray-600">Clear</Text>
          </View>
        </View>
        <View className="mt-2 bg-gray-200 rounded-lg py-3 px-3 w-auto">
          <Text>Branch - Bangalore</Text>
        </View>
      </View>
      {usersList.length === 0 ? (
        <View className="w-full h-full flex justify-center items-center mt-2">
          <Text className="text-gray-500">No Users Found</Text>
        </View>
      ) : (
        <FlatList
          data={usersList}
          className="mt-2"
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/users/user_details/[userId]",
                  params: {
                    userId: item.id as string,
                  },
                })
              }
              className="p-4"
            >
              <View className="w-full bg-white px-3 py-3 rounded-lg shadow-sm">
                <View className="flex">
                  <View className="flex-row justify-between w-full">
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
                        <Text className="font-bold">Dharani Shree</Text>
                        <Text className="text-gray-500 text-[13px] mt-[1px]">
                          +917848983259
                        </Text>
                      </View>
                    </View>
                    <View>
                      <View
                        className={`${item.statusDetails?.key === "ACTIVE" ? "bg-primary-200" : "bg-red-100"} px-4 py-3 rounded-lg`}
                      >
                        <Text
                          className={`${item.statusDetails?.key === "ACTIVE" ? "text-primary-950" : "text-red-500"} text-center font-semibold`}
                        >
                          Active
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="w-full mt-3">
                    <View className="flex-row items-center justify-between">
                      <View className="flex">
                        <Text className="text-gray-500 text-md ">
                          Department
                        </Text>
                        <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                          IT
                        </Text>
                      </View>
                      <View className="flex items-end">
                        <Text className="text-gray-500 text-md ">
                          Designation
                        </Text>
                        <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                          Developer
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="border-dashed border-[1px] border-gray-300 h-[1px] mt-3 mb-3 w-full" />
                  <View className="w-full">
                    <View className="flex-row items-center justify-between">
                      <View className="flex">
                        <Text className="text-gray-500 text-md ">
                          Raised Tickets
                        </Text>
                        <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                          002
                        </Text>
                      </View>
                      <View className="flex items-end">
                        <Text className="text-gray-500 text-md ">
                          Last Ticket Status
                        </Text>
                        <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                          Raised
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          )}
          keyExtractor={(_, index) => index.toString()}
          onEndReached={() => { }}
        />
      )}
    </View>
  );
};

export default UsersList;
