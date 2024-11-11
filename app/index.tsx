import LoadingBar from "@/components/LoadingBar";
import {
  REFRESH_TOKEN_KEY,
  AUTH_TOKEN_KEY,
  IS_LEAD,
  IS_WELCOMED,
} from "@/constants/storage_keys";
import { removeItem } from "@/utils/secure_store";
import { useEffect } from "react";
import { View } from "react-native";

const IndexPage = () => {
  useEffect(() => {
    // removeItem(REFRESH_TOKEN_KEY);
    // removeItem(AUTH_TOKEN_KEY);
    // removeItem(IS_LEAD);
    // removeItem(IS_WELCOMED);
  }, []);
  return (
    <View>
      <LoadingBar />
    </View>
  );
};

export default IndexPage;
