import LoadingBar from "@/components/LoadingBar";
import { useEffect } from "react";
import { View } from "react-native";

const IndexPage = () => {
  useEffect(() => {
    // setItem("IS_LEAD", "false");
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
