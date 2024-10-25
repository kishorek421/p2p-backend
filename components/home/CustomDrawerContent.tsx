import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/storage_keys";
import { removeItem } from "@/utils/secure_store";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { router } from "expo-router";
import { View, Text, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/AntDesign";

const CustomDrawerContent = (props: any) => {
  // useEffect(() => {

  // }, []);

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} scrollEnabled={false}>
        <View className="px-3 py-1">
          <Image
            source={require("../../assets/images/splash.png")}
            className="w-full h-32"
          />
        </View>
        <DrawerItemList {...props} />
        {/* <DrawerItem label={"Logout"} onPress={() => {}} /> */}
      </DrawerContentScrollView>
      <View className="mb-2">
        <View className="p-6 bg-slate-50">
          <TouchableOpacity
            onPress={async () => {
              await removeItem(AUTH_TOKEN_KEY);
              await removeItem(REFRESH_TOKEN_KEY);
              router.replace("/(auth)/login");
            }}
          >
            <View className="flex flex-row">
              <Text className="text-primary-950 font-bold text-md ">
                Logout
              </Text>
              <Icon name="logout" size={16} color="#009c68" className="ms-2" />
            </View>
          </TouchableOpacity>
        </View>
        {/* <View className="pb-6 pt-4 px-6">
          <TouchableOpacity
            onPress={async () => {
              await removeItem(AUTH_TOKEN_KEY);
              await removeItem(REFRESH_TOKEN_KEY);
              router.replace("/(auth)/login");
            }}
          >
            <View className="flex flex-row">
              <Text className="text-red-600 text-md ">Delete Accout</Text>
              <Icon name="delete" size={16} color="#dc2626" className="ms-2" />
            </View>
          </TouchableOpacity>
        </View> */}
      </View>
    </View>
  );
};

export default CustomDrawerContent;
