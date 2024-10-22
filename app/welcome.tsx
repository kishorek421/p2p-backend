import { View, Text, SafeAreaView } from "react-native";
import React, { useRef } from "react";
import { Button, ButtonText } from "@/components/ui/button";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

const WelcomePage = () => {
  const animationRef = useRef<LottieView>(null);

  return (
    <SafeAreaView className="bg-white">
      <View className="p-4 h-full">
        <View className="mt-8" />
        <LottieView
          ref={animationRef}
          source={require("../assets/lottie/login.json")}
          autoPlay
          loop
          style={{
            height: 250,
          }}
        />
        <View className="flex items-center">
          <Text className="mt-28 px-6 text-2xl text-center font-bold text-primary-950">
            Comprehensive IT and Workforce Management
          </Text>
          <Text className="text-gray-400 text-center px-8 mt-4 text-md">
            Enable rapid issue escalation and resolution for all your
            organization's IT infrastructure needs.
          </Text>
          <Button
            className="mt-28 bg-primary-900 h-14 rounded-lg shadow-sm"
            onPress={() => {
              router.push("/(auth)/login");
            }}
          >
            <ButtonText>Let's get started</ButtonText>
            <AntDesign
              name="arrowright"
              size={22}
              color="white"
              className="ms-2"
            />
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WelcomePage;
