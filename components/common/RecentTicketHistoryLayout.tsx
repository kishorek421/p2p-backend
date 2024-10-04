import { useEffect, useState } from "react";
import { TicketListItemModel } from "@/models/tickets";
import TicketListItemLayout from "@/components/tickets/TicketListItemLayout";
import { FlatList } from "react-native";
import api from "@/services/api";
import { GET_TICKETS_BY_STATUS_KEY } from "@/constants/api_endpoints";

const RecentTicketHistoryLayout = ({ placing }: { placing: string }) => {
  const [recentTickets, setRecentTickets] = useState<TicketListItemModel[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);

  useEffect(() => {
    fetchTickets(1);
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

  return (
    <FlatList
      data={recentTickets}
      renderItem={({ item }) => (
        <TicketListItemLayout
          cn={`${placing !== "home" && "m-3"} `}
          ticketModel={item}
        />
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
