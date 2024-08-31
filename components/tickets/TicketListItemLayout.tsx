import { Text, View } from "react-native";
import { TicketListItemModel } from "@/models/tickets";
import { Card } from "@/components/ui/card";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Divider } from "@/components/ui/divider";
import Icon from "react-native-vector-icons/AntDesign";
import moment from "moment";
import {
  ESCALATED,
  IN_PROGRESS,
  RAISED,
  TICKET_CLOSED,
} from "@/constants/configuration_keys";

const TicketListItemLayout = ({
  ticketModel,
  cn = "",
}: {
  ticketModel: TicketListItemModel;
  cn?: string;
}) => {
  const getStatusColor = (statusKey?: string): string => {
    switch (statusKey) {
      case ESCALATED:
        return "color-red-500 bg-red-100";
      case RAISED:
        return "color-blue-500 bg-blue-100";
      case IN_PROGRESS:
        return "color-secondary-950 bg-secondary-100";
      case TICKET_CLOSED:
        return "color-primary-950 bg-primary-100";
      default:
        console.log("statusKey ->", statusKey);
        return "bg-color-white color-gray-900";
    }
  };

  return (
    <Card className={`mb-4 rounded-lg ${cn}`}>
      <VStack>
        <HStack className="justify-between">
          <Text>Ticket Id:</Text>
          <Text className="color-secondary-950 underline font-bold">
            {ticketModel.ticketNo ?? "-"}
          </Text>
        </HStack>
        <HStack className="justify-between mt-4">
          <Text>Asset Type:</Text>
          <Text className=" font-medium color-gray-600">
            {ticketModel.assetInUseDetails?.assetMasterDetails?.serialNo ?? "-"}
          </Text>
        </HStack>
        <HStack className="justify-between mt-4">
          <Text>Issue Type:</Text>
          <Text className="  font-medium color-gray-600">
            {ticketModel.issueTypeDetails?.value ?? "-"}
          </Text>
        </HStack>
        <Divider className="my-4" />
        <HStack className="justify-between">
          <HStack className="items-center">
            <Icon name="clockcircleo" color="gray" />
            <Text className="ms-2 text-sm color-gray-500">
              {ticketModel.createdAt
                ? moment(ticketModel.createdAt).fromNow()
                : "-"}
            </Text>
          </HStack>
          <View
            className={`py-2 px-4 rounded ${getStatusColor(ticketModel.statusDetails?.key)}`}
          >
            <Text
              className={`${getStatusColor(ticketModel.statusDetails?.key)}`}
            >
              {ticketModel.statusDetails?.value ?? "-"}
            </Text>
          </View>
        </HStack>
      </VStack>
    </Card>
  );
};

export default TicketListItemLayout;
