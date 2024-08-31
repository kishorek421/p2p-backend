import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import BottomSheet from "./BottomSheet";

type SingleImagePickerComponentProps = {
  onImagePicked: (uri: string) => void;
  setIsModalVisible: any;
  bottomSheetRef: any;
};

const SingleImagePickerComponent: React.FC<SingleImagePickerComponentProps> = ({
  onImagePicked,
  setIsModalVisible,
  bottomSheetRef,
}) => {
  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || mediaLibraryStatus !== "granted") {
        alert(
          "Sorry, we need camera and media library permissions to make this work!",
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const permissionsGranted = await requestPermissions();
    if (!permissionsGranted) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      onImagePicked(uri);
      closeModal();
    }
  };

  const takePhoto = async () => {
    const permissionsGranted = await requestPermissions();
    if (!permissionsGranted) return;

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      onImagePicked(uri);
      closeModal();
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    bottomSheetRef.current?.hide();
  };

  return (
    // <Modalize
    //   ref={modalizeRef}
    //   onClose={closeModal}
    //   snapPoint={180}
    //   withOverlay={true}
    //   handlePosition="inside"
    // >
    //   <View style={styles.modalContent}>
    //     <TouchableOpacity style={styles.option} onPress={pickImage}>
    //       <Text style={styles.optionText}>Pick an Image from Gallery</Text>
    //     </TouchableOpacity>
    //     <TouchableOpacity style={styles.option} onPress={takePhoto}>
    //       <Text style={styles.optionText}>Take a Photo</Text>
    //     </TouchableOpacity>
    //   </View>
    // </Modalize>
    <BottomSheet initialHeight={200} ref={bottomSheetRef}>
      <View style={styles.modalContent}>
        <TouchableOpacity style={styles.option} onPress={pickImage}>
          <Text style={styles.optionText}>Pick an Image from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={takePhoto}>
          <Text style={styles.optionText}>Take a Photo</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    padding: 20,
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  optionText: {
    fontSize: 18,
    textAlign: "center",
  },
});

export default SingleImagePickerComponent;
