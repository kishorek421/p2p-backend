import RecentTicketHistoryLayout from "@/components/home/RecentTicketHistoryLayout";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import Icon from "react-native-vector-icons/AntDesign";
import { router, useLocalSearchParams } from "expo-router";

const TicketsHistoryScreen = () => {
  const { customerId } = useLocalSearchParams();

  return (
    <VStack>
      <Button
        className="bg-primary-950 mx-4 mt-4"
        onPress={() =>
          router.push({
            pathname: "/raise_ticket/[customerId]",
            params: { customerId: customerId as string },
          })
        }
      >
        <ButtonText>Raise a Ticket</ButtonText>
        <Icon name="arrowright" color="white" size={22} className="ms-2" />
      </Button>
      <RecentTicketHistoryLayout placing="tickets_list" />
    </VStack>
  );
};

export default TicketsHistoryScreen;
