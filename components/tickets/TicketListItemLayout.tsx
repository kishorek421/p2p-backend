import { Text, View } from "react-native";
import { TicketListItemModel } from "@/models/tickets";
import { Card } from "@/components/ui/card";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Divider } from "@/components/ui/divider";
import Icon from "react-native-vector-icons/AntDesign";
import moment from "moment";
import { TouchableOpacity } from "react-native-gesture-handler";
import { router } from "expo-router";
import TicketStatusComponent from "./TicketStatusComponent";

const TicketListItemLayout = ({
  ticketModel,
  cn = "",
}: {
  ticketModel: TicketListItemModel;
  cn?: string;
}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: "/tickets/tickets_history/details/[ticketId]",
          params: {
            ticketId: ticketModel.id ?? "",
          },
        });
      }}
    >
      <Card className={`mb-4 rounded-lg ${cn}`}>
        <VStack>
          <HStack className="justify-between">
            <Text>Ticket Id:</Text>
            <Text className="color-secondary-950 underline font-bold">
              {ticketModel.ticketNo ?? "-"}
            </Text>
          </HStack>
          <HStack className="justify-between mt-4">
            <Text>Asset Id:</Text>
            <Text className=" font-medium color-gray-600">
              {ticketModel.assetInUseDetails?.assetMasterDetails?.serialNo ??
                "-"}
            </Text>
          </HStack>
          <HStack className="justify-between mt-4">
            <Text>Issue Type:</Text>
            <Text className="  font-medium color-gray-600">
              {ticketModel.issueTypeDetails?.name ?? "-"}
            </Text>
          </HStack>
          <Divider className="my-4" />
          <HStack className="justify-between">
            <HStack className="items-center gap-1">
              <Icon name="clockcircleo" color="gray" />
              <Text className="text-sm color-gray-500">
                {ticketModel.createdAt
                  ? moment(ticketModel.createdAt).fromNow()
                  : "-"}
              </Text>
            </HStack>
            <TicketStatusComponent
              statusKey={ticketModel.statusDetails?.key}
              statusValue={ticketModel.statusDetails?.value}
            />
          </HStack>
        </VStack>
      </Card>
    </TouchableOpacity>
  );
};

export default TicketListItemLayout;
