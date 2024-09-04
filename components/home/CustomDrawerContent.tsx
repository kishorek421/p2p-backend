import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/storage_keys";
import { removeItem } from "@/utils/secure_store";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { router } from "expo-router";
import { View, Text } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/AntDesign";

const CustomDrawerContent = (props: any) => {
  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} scrollEnabled={false}>
        <DrawerItemList {...props} />
        {/* <DrawerItem label={"Logout"} onPress={() => {}} /> */}
      </DrawerContentScrollView>
      <View className="mb-2 p-6 bg-slate-50">
        <TouchableOpacity
          onPress={async () => {
            await removeItem(AUTH_TOKEN_KEY);
            await removeItem(REFRESH_TOKEN_KEY);
            router.replace("/(auth)/login");
          }}
        >
          <View className="flex flex-row">
            <Text className="text-secondary-800 font-bold text-md ">
              Logout
            </Text>
            <Icon name="logout" size={16} color="#f5be47" className="ms-2" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomDrawerContent;
