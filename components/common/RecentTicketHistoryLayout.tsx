import { useEffect, useState } from "react";
import { TicketListItemModel } from "@/models/tickets";
import { FlatList, View, Text } from "react-native";
import api from "@/services/api";
import { GET_TICKETS_BY_STATUS_KEY } from "@/constants/api_endpoints";
import TicketListItemLayout from "../tickets/TicketListItemLayout";
import React from "react";
import useRefresh from "@/hooks/useRefresh";

const RecentTicketHistoryLayout = ({ placing }: { placing: string }) => {
  const [recentTickets, setRecentTickets] = useState<TicketListItemModel[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const { refreshFlag, setRefreshFlag } = useRefresh();

  useEffect(() => {
    setRecentTickets([]);
    fetchTickets(1);
  }, []);

  useEffect(() => {
    setRecentTickets([]);
    if (refreshFlag) {
      fetchTickets(1);
    }
  }, [refreshFlag]);

  const fetchTickets = (nextPageNumber: number) => {
    api
      .get(GET_TICKETS_BY_STATUS_KEY, {
        params: {
          status: "",
          pageNo: nextPageNumber,
          pageSize: 10,
        },
      })
      .then((response) => {
        let content = response.data?.data?.content ?? [];
        console.log("content", content);
        if (nextPageNumber === 1) {
          setRecentTickets(content);
        } else {
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
        setRefreshFlag(false);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return recentTickets.length === 0 ? (
    <View
      className={` bg-gray-200 flex justify-center items-center rounded-lg h-36 ${
        placing === "home" ? "mx-4 mt-0" : "mx-4 mt-4"
      }`}
    >
      <Text className="text-gray-500 text-sm text-center">
        No Recent Tickets Found
      </Text>
    </View>
  ) : (
    <FlatList
      data={recentTickets}
      renderItem={({ item, index }) => (
        <TicketListItemLayout cn={`my-2 px-4`} ticketModel={item} />
      )}
      className={`${placing === "home" ? "h-96 mb-16" : ""}`}
      keyExtractor={(_, index) => index.toString()}
      onEndReached={() => {
        if (placing !== "home" && !isLastPage) {
          fetchTickets(currentPage + 1);
        }
      }}
      ListFooterComponent={
        <View style={{ height: placing === "home" ? 30 : 140 }} />
      }
    />
  );
};

export default RecentTicketHistoryLayout;
