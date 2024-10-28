import { useEffect, useState } from "react";
import { TicketListItemModel } from "@/models/tickets";
import { FlatList, View, Text } from "react-native";
import api from "@/services/api";
import { GET_TICKETS_BY_STATUS_KEY } from "@/constants/api_endpoints";
import TicketStatusComponent from "../tickets/TicketStatusComponent";
import TicketListItemLayout from "../tickets/TicketListItemLayout";
import { useFocusEffect } from "expo-router";
import React from "react";
import useRefresh from "@/hooks/useRefresh";

const RecentTicketHistoryLayout = ({ placing }: { placing: string }) => {
  const [recentTickets, setRecentTickets] = useState<TicketListItemModel[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const { refreshFlag } = useRefresh();

  useEffect(() => {
    fetchTickets(1);
  }, [refreshFlag]);

  const fetchTickets = (currentPage: number) => {
    if (currentPage === 1) {
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
        <TicketListItemLayout
          cn={`${placing !== "home" ? "m-3" : "mb-4"} `}
          ticketModel={item}
        />
      )}
      className={`my-4 ${placing === "home" ? "h-96 pb-16" : ""}`}
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
