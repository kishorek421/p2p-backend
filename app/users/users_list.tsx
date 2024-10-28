import { View, Text, FlatList, Pressable, Image } from "react-native";
import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { router } from "expo-router";

import { GET_USERS_LIST } from "@/constants/api_endpoints";
import { UserDetailsModel } from "@/models/users";
import TicketStatusComponent from "@/components/tickets/TicketStatusComponent";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import UserListItemLayout from "@/components/users/UserListItemLayout";

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
           <UserListItemLayout   userDetailsModel={item} />
          )}
          keyExtractor={(_, index) => index.toString()}
          onEndReached={() => { }}
        />
      )}
    </View>
  );
};

export default UsersList;
