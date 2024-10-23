import { View, Text, Image, FlatList, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { HStack } from "@/components/ui/hstack";
import { Card } from "@/components/ui/card";
import { Button, ButtonText } from "@/components/ui/button";
import api from "@/services/api";
import { router } from "expo-router";

import { GET_USERS_LIST } from "@/constants/api_endpoints";
import { UserDetailsModel } from "@/models/users";

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
  return usersList.length === 0 ? (
    <View className="w-full h-full flex justify-center items-center">
      <Text className="text-gray-500">No Users Found</Text>
    </View>
  ) : (
    <FlatList
      data={usersList}
      renderItem={({ item }) => (
        <TouchableOpacity
          className="p-4"
          onPress={() =>
            router.push({
              pathname: "/users/user_details/[userId]",
              params: {
                userId: item.id as string,
              },
            })
          }
        >
          <Card className="p-0 rounded-xl">
            <HStack>
              <Image
                source={{
                  uri: "https://plus.unsplash.com/premium_photo-1661297414288-8ed17eb1b3f1?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                }}
                width={130}
                height={200}
                className="rounded-s-xl"
              />

              <View className="px-4 py-3 gap-5 flex flex-1">
                <View className="flex-row justify-between">
                  <Text className="text-gray-500">Name</Text>
                  <Text className="">
                    {item.firstName ?? "-"} {item.lastName ?? ""}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-500">Mobile</Text>
                  <Text>{item.mobile ?? "-"}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-500">User Type</Text>
                  <Text>{item.userTypeDetails?.value ?? "-"}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-500">Organization</Text>
                  <Text className="">{item.orgDetails?.name ?? "-"}</Text>
                </View>
                <View>
                  <View
                    className={`${item.statusDetails?.key === "ACTIVE" ? "bg-primary-950" : "bg-secondary-950"} px-2 py-3 rounded-lg`}
                  >
                    <Text className="text-white text-center font-semibold">
                      Active
                    </Text>
                  </View>
                </View>
              </View>
            </HStack>
          </Card>
        </TouchableOpacity>
      )}
      keyExtractor={(_, index) => index.toString()}
      onEndReached={() => {}}
    />
  );
};

export default UsersList;
