import { View } from "react-native";
import { VStack } from "@/components/ui/vstack";
import ContentLayout from "@/components/home/ContentLayout";
import React, { useEffect, useState } from "react";
import { CustomerDetailsModel } from "@/models/customers";
import api from "@/services/api";
import { GET_CUSTOMER_DETAILS } from "@/constants/api_endpoints";

const HomeScreen = () => {
  const [customerDetails, setCustomerDetails] = useState<CustomerDetailsModel>(
    {},
  );

  useEffect(() => {
    api
      .get(GET_CUSTOMER_DETAILS, {})
      .then((response) => {
        console.log("customerDetails", response);
        setCustomerDetails(response.data?.data ?? []);
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  return (
    <View className="py-2 px-4">
      <VStack>
        {/* <HStack className="justify-between items-center">
        <Icon name="bars" size={26} />
        <Avatar size="md">
          <AvatarFallbackText>
            {customerDetails?.orgDetails?.name ?? "-"}
          </AvatarFallbackText>
          <AvatarImage
            source={{
              uri: customerDetails?.branchDetails?.branchPic,
            }}
          />
        </Avatar>
      </HStack> */}
        <ContentLayout customerDetails={customerDetails} />
      </VStack>
    </View>
  );
};

export default HomeScreen;
