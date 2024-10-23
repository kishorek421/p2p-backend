import { View, Text, Image } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";

const ImageViewer = () => {
  const { uri } = useLocalSearchParams();

  console.log(uri);

  return (
    <View className=" h-full flex justify-center items-center">
      <Image className="w-full h-96" source={{ uri: uri.toString() }} />
    </View>
  );
};

export default ImageViewer;
