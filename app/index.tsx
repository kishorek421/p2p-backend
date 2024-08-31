import { Redirect } from "expo-router";

const IndexPage = () => {
  return <Redirect href="/(auth)/login" />;
};

export default IndexPage;
