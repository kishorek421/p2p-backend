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
  const [authorizedModules, setAuthorizedModules] = useState();

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
    <View className="pb-2 px-4">
      <VStack>
        <ContentLayout customerDetails={customerDetails} />
      </VStack>
    </View>
  );
};

export default HomeScreen;
