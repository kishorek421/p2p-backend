import { Text } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { TicketListItemModel } from "@/models/tickets";
import api from "@/services/api";
import { GET_TICKET_DETAILS } from "@/constants/api_endpoints";
import LoadingBar from "@/components/LoadingBar";
import { VStack } from "@/components/ui/vstack";
import { Card } from "@/components/ui/card";
import { ScrollView } from "react-native-gesture-handler";
import TicketStatusComponent from "@/components/tickets/TicketStatusComponent";

const TicketDetails = () => {
  const { ticketId } = useLocalSearchParams();

  const [ticketModel, setTicketModel] = useState<TicketListItemModel>({});

  const [isLoading, setIsLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerLeftContainerStyle: {
        paddingStart: 10,
      },
    });

    api
      .get(GET_TICKET_DETAILS + `?ticketId=${ticketId}`)
      .then((response) => {
        setIsLoading(false);
        setTicketModel(response.data.data ?? {});
      })
      .catch((e) => {
        console.error(e);
        setIsLoading(false);
      });
  }, [ticketId, navigation]);

  return isLoading ? (
    <LoadingBar />
  ) : (
    <ScrollView>
      <Card className="px-3 py-4 bg-white m-4 mb-8">
        <VStack className="gap-6">
          <VStack>
            <Text>Ticket Id</Text>
            <Text className="color-secondary-950 underline font-bold mt-1">
              {ticketModel.ticketNo ?? "-"}
            </Text>
          </VStack>
          <VStack>
            <Text className="mb-1">Ticket Status</Text>
            <TicketStatusComponent
              statusKey={ticketModel.statusDetails?.key}
              statusValue={ticketModel.statusDetails?.value}
            />
          </VStack>
          <VStack>
            <Text>Asset Id</Text>
            <Text className=" font-medium color-gray-600 mt-1">
              {ticketModel.assetInUseDetails?.assetMasterDetails?.serialNo ??
                "-"}
            </Text>
          </VStack>
          <VStack>
            <Text>Asset Type</Text>
            <Text className=" font-medium color-gray-600 mt-1">
              {ticketModel.assetInUseDetails?.assetMasterDetails
                ?.assetTypeDetails?.name ?? "-"}
            </Text>
          </VStack>
          <VStack>
            <Text>Issue Type</Text>
            <Text className=" font-medium color-gray-600 mt-1">
              {ticketModel.issueTypeDetails?.name ?? "-"}
            </Text>
          </VStack>
          <VStack>
            <Text>Description</Text>
            <Text className=" font-medium color-gray-600 mt-1">
              {ticketModel.description ?? "-"}
            </Text>
          </VStack>
        </VStack>
      </Card>
    </ScrollView>
  );
};

export default TicketDetails;
