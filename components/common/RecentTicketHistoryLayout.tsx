import { useEffect, useState } from "react";
import { TicketListItemModel } from "@/models/tickets";
import TicketListItemLayout from "@/components/tickets/TicketListItemLayout";
import { FlatList, View, Text, Image } from "react-native";
import api from "@/services/api";
import { GET_TICKETS_BY_STATUS_KEY } from "@/constants/api_endpoints";
import AntDesign from "@expo/vector-icons/AntDesign";
import TicketStatusComponent from "../tickets/TicketStatusComponent";

const RecentTicketHistoryLayout = ({ placing }: { placing: string }) => {
  const [recentTickets, setRecentTickets] = useState<TicketListItemModel[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);

  useEffect(() => {
    fetchTickets(1);

    setRecentTickets([{}]);
  }, []);

  const fetchTickets = (currentPage: number) => {
    if (currentPage === 0) {
      setRecentTickets([]);
    }
    api
      .get(GET_TICKETS_BY_STATUS_KEY, {
        params: {
          status: "",
          pageNo: currentPage,
          pageSize: placing === "home" ? 3 : 10,
        },
      })
      .then((response) => {
        let content = response.data?.data?.content ?? [];
        if (content && content.length > 0) {
          setRecentTickets((prevState) => [...prevState, ...content]);
        }
        let paginator = response.data?.data?.paginator;
        if (paginator) {
          let iCurrentPage = paginator.currentPage;
          let iLastPage = paginator.lastPage;
          if (iCurrentPage && iLastPage !== undefined) {
            setCurrentPage(iCurrentPage);
            setIsLastPage(iLastPage);
          }
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return recentTickets.length === 0 ? (
    <View
      className={`mt-4 bg-gray-200 flex justify-center items-center rounded-lg h-36 ${
        placing === "home" ? "mx-0" : "mx-4"
      }`}
    >
      <Text className="text-gray-500 text-sm text-center">
        No Recent Tickets Found
      </Text>
    </View>
  ) : (
    <FlatList
      data={recentTickets}
      renderItem={({ item }) => (
        // <TicketListItemLayout
        //   cn={`${placing !== "home" && "m-3"} `}
        //   ticketModel={item}
        // />

        <View className="w-full bg-white px-3 py-3 rounded-lg">
          <View className="flex">
            <View className="flex-row justify-between w-full">
              <View>
                <Text className="text-gray-900 font-bold">TK0001</Text>
                <Text className="text-gray-500 text-[13px] mt-[1px]">
                  Issue in Display not working
                </Text>
              </View>
              <TicketStatusComponent
                statusKey={"RAISED"}
                statusValue={"Raised"}
              />
            </View>
            <View className="border-dashed border-[1px] border-gray-300 h-[1px] mt-3 mb-3 w-full" />
            <View className="w-full">
              <View className="flex-row items-center justify-between">
                <View className="flex">
                  <Text className="text-gray-500 text-md ">Raised by</Text>
                  <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                    Dharani Shree
                  </Text>
                </View>
                {/* <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1445053023192-8d45cb66099d?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  }}
                  width={30}
                  height={30}
                  className="rounded-full"
                /> */}
                {/* <View className="text-gray-500 bg-gray-200 p-1 rounded-full">
                  <AntDesign name="arrowright" size={18} color="#6b7280" />
                </View> */}
                <View className="flex items-end">
                  <Text className="text-gray-500 text-md ">Raised At</Text>
                  <Text className="text-md text-gray-900 font-semibold  mt-[2px]">
                    27-12-2024
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
      className={`my-4 ${placing === "home" ? "h-96" : ""}`}
      keyExtractor={(_, index) => index.toString()}
      onEndReached={() => {
        if (placing !== "home" && !isLastPage) {
          fetchTickets(currentPage + 1);
        }
      }}
    />
  );
};

export default RecentTicketHistoryLayout;
