import { View, Text, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { GET_USERS_LIST } from "@/constants/api_endpoints";
import { UserDetailsModel } from "@/models/users";
import UserListItemLayout from "@/components/users/UserListItemLayout";
import useRefresh from "@/hooks/useRefresh";

const UsersList = () => {
  const [usersList, setUsersList] = useState<UserDetailsModel[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const { refreshFlag } = useRefresh();

  function fetchUsersList(nextPageNumber: number) {
    if (nextPageNumber === 1) {
      setUsersList([]);
    }

    api
      .get(GET_USERS_LIST, {
        params: {
          pageNo: nextPageNumber,
          pageSize: 10,
        },
      })
      .then((response) => {
        let content = response.data?.data?.content ?? [];
        if (content && content.length > 0) {
          setUsersList((prevState) => [...prevState, ...content]);
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
      });
  }

  useEffect(() => {
    fetchUsersList(1);
  }, [refreshFlag]);

  return (
    <View className="bg-white h-full">
      {usersList.length === 0 ? (
        <View className="w-full h-full flex justify-center items-center mt-2">
          <Text className="text-gray-500">No Users Found</Text>
        </View>
      ) : (
        <FlatList
          data={usersList}
          className="mt-2"
          renderItem={({ item }) => (
            <UserListItemLayout userDetailsModel={item} />
          )}
          keyExtractor={(_, index) => index.toString()}
          onEndReached={() => {
            if (!isLastPage) {
              fetchUsersList(currentPage + 1);
            }
          }}
          ListFooterComponent={<View style={{ height: 30 }} />}
        />
      )}
    </View>
  );
};

export default UsersList;
