import { View, Text, Pressable, Image } from "react-native";
import React from "react";
import { router } from "expo-router";
import { UserDetailsModel } from "@/models/users";

interface UserListItemLayoutProps {
  userDetailsModel: UserDetailsModel;
}

const UserListItemLayout = ({ userDetailsModel }: UserListItemLayoutProps) => {
  console.log(userDetailsModel.orgDepartmentDetails);
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/users/user_details/[userId]",
          params: {
            userId: userDetailsModel.id as string,
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
                <Text className="font-bold">
                  {userDetailsModel.firstName ?? "-"}{" "}
                  {userDetailsModel.lastName ?? ""}
                </Text>
                <Text className="text-gray-500 text-[13px] mt-[1px]">
                  {userDetailsModel.mobile ?? "-"}
                </Text>
              </View>
            </View>
            <View>
              <View
                className={`${userDetailsModel.statusDetails?.key === "ACTIVE" ? "bg-primary-200" : "bg-red-100"} px-4 py-3 rounded-lg`}
              >
                <Text
                  className={`${userDetailsModel.statusDetails?.key === "ACTIVE" ? "text-primary-950" : "text-red-500"} text-center font-semibold`}
                >
                  Active
                </Text>
              </View>
            </View>
          </View>
          <View className="w-full mt-3">
            <View className="flex-row items-center justify-between">
              <View className="flex">
                <Text className="text-gray-500 text-md ">Department</Text>
                <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                  {userDetailsModel.departmentDetails?.name ?? "-"}
                </Text>
              </View>
              <View className="flex items-end">
                <Text className="text-gray-500 text-md ">Designation</Text>
                <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                  {userDetailsModel.designationDetails?.name ?? "-"}
                </Text>
              </View>
            </View>
          </View>
          <View className="border-dashed border-[1px] border-gray-300 h-[1px] mt-3 mb-3 w-full" />
          <View className="w-full">
            <View className="flex-row items-center justify-between">
              <View className="flex">
                <Text className="text-gray-500 text-md ">Raised Tickets</Text>
                <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                  {userDetailsModel.ticketDetails?.raisedTicketCount ?? "-"}
                </Text>
              </View>
              <View className="flex items-end">
                <Text className="text-gray-500 text-md ">
                  Last Ticket Status
                </Text>
                <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                  {userDetailsModel.ticketDetails?.lastTicketStatus ?? "-"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default UserListItemLayout;
