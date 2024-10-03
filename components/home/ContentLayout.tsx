import { Image, Text, TouchableWithoutFeedback, View } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import React from "react";
import { Button, ButtonText } from "@/components/ui/button";
import Icon from "react-native-vector-icons/AntDesign";
import RecentTicketHistoryLayout from "@/components/common/RecentTicketHistoryLayout";
import { CustomerDetailsModel } from "@/models/customers";
import { TouchableOpacity } from "react-native-gesture-handler";
import { router } from "expo-router";

const ContentLayout = ({
  customerDetails,
}: {
  customerDetails: CustomerDetailsModel;
}) => {
  return (
    <VStack className="mt-4">
      <Text className="text-2xl font-bold">
        Hello{" "}
        <Text className="color-primary-950">
          {customerDetails.firstName ?? "-"} {customerDetails.lastName ?? ""} 👋
        </Text>
      </Text>
      <Text className="color-gray-500 mt-1 text-sm">
        How can we assist you today?
      </Text>
      <Card size="md" variant="elevated" className="mt-8 pb-0 ps-4 rounded-2xl">
        <HStack>
          <VStack className="w-44 justify-evenly">
            <VStack>
              <Text className="text-2xl font-medium">
                Having trouble with your
                <Text className="text-primary-950"> Device?</Text>
              </Text>
            </VStack>
            <Button
              className="mb-4 mt-4 bg-gray-900"
              onPress={() =>
                router.push({
                  pathname: "/raise_ticket/[customerId]",
                  params: {
                    customerId: customerDetails.id ?? "",
                  },
                })
              }
            >
              <ButtonText>Let us know</ButtonText>
              <Icon
                name="arrowright"
                className="ms-3"
                color="white"
                size={20}
              />
            </Button>
          </VStack>
          <Image
            source={require("../../assets/images/card_man.png")}
            className="w-[200px] h-[200px] me-4"
          />
        </HStack>
      </Card>
      <VStack className="mt-8">
        <Text className="text-[18px] font-bold">Quick Actions</Text>
        <TouchableOpacity className="mt-2" onPress={() => {
          router.push("/devices/devices_list");
        }}>
          <Text>My Devices</Text>
        </TouchableOpacity>
        <TouchableOpacity className ="mt-2" onPress={()=>{
          router.push({
            pathname: "/employees/employees_list",
          });

        }}>
          <Text>Employees</Text>
        </TouchableOpacity>

        <TouchableOpacity className ="mt-2" onPress={()=>{
          router.push({
            pathname: "/employees/employee_details/[employeeId]",
            params: {
              employeeId: "123",
            }
          });

        }}>
          <Text>Employee_Id</Text>
        </TouchableOpacity>


        
      </VStack>
      
      <HStack className="justify-between mt-10">
        <Text className="text-[18px] font-bold">Latest Tickets</Text>
        <TouchableWithoutFeedback
          onPress={() =>
            router.push({
              pathname: "/tickets_history/[customerId]",
              params: {
                customerId: customerDetails.id ?? "",
              },
            })
          }
        >
          <Text className="text-md underline color-primary-950 font-medium">
            View All
          </Text>
        </TouchableWithoutFeedback>
      </HStack>
      <RecentTicketHistoryLayout placing="home" />
    </VStack>
  );
};

export default ContentLayout;
