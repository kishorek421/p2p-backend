import { View, Text, Image, FlatList } from "react-native";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { VStack } from "@/components/ui/vstack";

import { useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import DeviceListItemLayout from "@/components/devices/DeviceListItemLayout";

const EmployeeDetails = () => {
  const { employeeId } = useLocalSearchParams();

  const [assignedDevicesList, setAssignedDevicesList] = useState();

  return (
    <View>
      <View className="p-6">
        <Card className="p-0">
          <View className="flex">
            <Image
              source={{
                uri: "https://plus.unsplash.com/premium_photo-1661297414288-8ed17eb1b3f1?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              }}
              style={{ height: 150 }}
              className=""
            />

            <View className="flex px-4 py-3 gap-5">
              <Button className="rounded-lg">
                <Text className="">Active</Text>
              </Button>
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Name</Text>
                <Text className="underline">John Doe</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Role</Text>
                <Text>Admin</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Designation</Text>
                <Text>Director</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Department</Text>
                <Text>Engineers</Text>
              </View>
            </View>
          </View>
        </Card>
        <View className="mt-6">
          <Text className="font-extrabold text-lg">Assigned Assets</Text>
        </View>
        <FlatList
          data={assignedDevicesList}
          renderItem={({ item }) => <DeviceListItemLayout data={item} />}
          keyExtractor={(_, index) => index.toString()}
          onEndReached={() => {}}
        />
      </View>
    </View>
  );
};

export default EmployeeDetails;
