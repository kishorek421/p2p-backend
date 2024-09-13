import { VStack } from "@/components/ui/vstack";
import React, { useEffect, useRef, useState } from "react";
import {
  CREATE_TICKET,
  GET_ASSETS_IN_USE,
  GET_ISSUE_TYPES,
  TICKET_UPLOADS,
} from "@/constants/api_endpoints";
import {
  AssetInUseListItemModel,
  IssueTypeListItemModel,
} from "@/models/assets";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import CustomSelect from "@/components/CustomSelect";
import { DropdownModel, ErrorModel } from "@/models/common";
import { getFileName, isFormFieldInValid } from "@/utils/helper";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Text } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import FeatherIcon from "react-native-vector-icons/Feather";
import AntIcon from "react-native-vector-icons/AntDesign";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RaiseTicketRequestModel } from "@/models/tickets";
import api from "@/services/api";
import { HStack } from "@/components/ui/hstack";
import SubmitButton from "@/components/SubmitButton";
import ImagePickerComponent from "@/components/ImagePickerComponent";
import Toast from "react-native-toast-message";

const RaiseTicketScreen = () => {
  const [assetsInUse, setAssetsInUse] = useState<AssetInUseListItemModel[]>([]);
  const [issueTypes, setIssueTypes] = useState<IssueTypeListItemModel[]>([]);
  const [errors, setErrors] = useState<ErrorModel[]>([]);

  const { customerId } = useLocalSearchParams();

  const [selectedAssetInUse, setSelectedAssetInUse] = useState<DropdownModel>();
  const [selectedIssueType, setSelectedIssueType] = useState<DropdownModel>();

  const [assetImages, setAssetImages] = useState<string[]>([]);

  const bottomSheetRef = useRef(null);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [raiseTicketModel, setRaiseTicketModel] =
    useState<RaiseTicketRequestModel>({});

  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerLeftContainerStyle: {
        paddingStart: 10,
      },
    });

    const loadAssetsInUse = () => {
      let params = `customerId=${customerId}`;
      api
        .get(GET_ASSETS_IN_USE + `?${params}`, {})
        .then((response) => {
          setAssetsInUse(response.data?.data ?? []);
        })
        .catch((e) => {
          console.error(e);
        });
    };
    const loadIssueTypes = () => {
      api
        .get(GET_ISSUE_TYPES, {})
        .then((response) => {
          setIssueTypes(response.data?.data?.content ?? []);
        })
        .catch((e) => {
          console.error(e);
        });
    };

    loadAssetsInUse();
    loadIssueTypes();
  }, [customerId, navigation]);

  const setSelectedDropdown = (type: string, e: any) => {
    switch (type) {
      case "assetInUse":
        let selectedAssetInUse = assetsInUse.find(
          (assetInUse) => assetInUse.id === e,
        );
        setSelectedAssetInUse({
          label: selectedAssetInUse?.serialNo?.toString(),
          value: selectedAssetInUse?.id,
        });
        break;
      case "issueType":
        let selectedIssueType = issueTypes.find(
          (issueType) => issueType.id === e,
        );
        setSelectedIssueType({
          label: selectedIssueType?.name?.toString(),
          value: selectedIssueType?.id,
        });
        break;
    }
  };

  const toggleImagePicker = () => {
    setIsModalVisible(!isModalVisible);
    if (!isModalVisible) {
      bottomSheetRef.current?.show();
    } else {
      bottomSheetRef.current?.hide();
    }
  };

  const raiseTicket = () => {
    raiseTicketModel.assetInUse = selectedAssetInUse?.value;
    raiseTicketModel.issueType = selectedIssueType?.value;

    const formData = new FormData();

    setIsLoading(true);

    if (assetImages.length > 0) {
      console.log(assetImages);
      for (let i = 0; i < assetImages.length; i++) {
        const assetImage = assetImages[i];
        formData.append("assetImages", {
          uri: assetImage,
          type: "image/jpeg",
          name: getFileName(assetImage, true),
        });
      }
    }

    console.log("formData", formData);

    setErrors([]);

    api
      .post(TICKET_UPLOADS, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        const uploadedAssetImages = response.data.data;
        console.log("uploadedAssetImages", uploadedAssetImages);

        if (uploadedAssetImages) {
          let ticketData = {
            assetInUseId: selectedAssetInUse?.value,
            issueTypeId: selectedIssueType?.value,
            description: raiseTicketModel.description,
            assetImages: uploadedAssetImages,
          };

          console.log("ticketData", ticketData);

          api
            .post(CREATE_TICKET, ticketData)
            .then((response) => {
              console.log(response.data.data);
              setIsLoading(false);
              Toast.show({
                type: "success",
                text1: "Ticket Created Sucessfully",
              });
              router.back();
            })
            .catch((e) => {
              // console.error(e.response);
              let errors = e.response?.data?.errors;
              if (errors) {
                console.error("errors -> ", errors);
                setErrors(errors);
              }
              setIsLoading(false);
            });
        } else {
          setIsLoading(false);
        }
      })
      .catch((e) => {
        let errors = e.response?.data?.errors;
        console.log(errors);
        setIsLoading(false);
      });
    // api
    //   .post(RAISE_TICKET, formData, {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //     },
    //   })
    //   .then((response) => {
    //     // router.push({pathname: ""});
    //     console.log(response.data);
    //   })
    //   .catch((e) => {
    //     // console.error(e.response);
    //     let errors = e.response?.data?.errors;
    //     if (errors) {
    //       console.error("errors -> ", errors);
    //       setErrors(errors);
    //     }
    //     setIsLoading(false);
    //   });
  };

  return (
    <GestureHandlerRootView>
      <VStack className="p-4 gap-4">
        <FormControl
          isInvalid={isFormFieldInValid("assetInUseId", errors).length > 0}
        >
          <FormControlLabel className="mb-1">
            <FormControlLabelText>Asset</FormControlLabelText>
          </FormControlLabel>
          <CustomSelect
            options={assetsInUse.map((assetInUse) => ({
              label: assetInUse.serialNo?.toString(),
              value: assetInUse.id,
            }))}
            placeholder="Select asset"
            selectedValue={selectedAssetInUse}
            type="assetInUse"
            onChange={setSelectedDropdown}
          />
          <FormControlError>
            <FormControlErrorText>
              {isFormFieldInValid("assetInUseId", errors)}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
        <FormControl
          isInvalid={isFormFieldInValid("issueTypeId", errors).length > 0}
        >
          <FormControlLabel className="mb-1">
            <FormControlLabelText>Issue Type</FormControlLabelText>
          </FormControlLabel>
          <CustomSelect
            options={issueTypes.map((assetInUse) => ({
              label: assetInUse.name?.toString(),
              value: assetInUse.id,
            }))}
            selectedValue={selectedIssueType}
            type="issueType"
            placeholder="Select issue type"
            onChange={setSelectedDropdown}
          />
          <FormControlError>
            <FormControlErrorText>
              {isFormFieldInValid("issueTypeId", errors)}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
        <FormControl
          isInvalid={isFormFieldInValid("description", errors).length > 0}
        >
          <FormControlLabel className="mb-1">
            <FormControlLabelText>Issue Description</FormControlLabelText>
          </FormControlLabel>
          <Textarea size="md" variant="default">
            <TextareaInput
              placeholder="Write a short description about your issue"
              onChangeText={(e) => {
                if (raiseTicketModel) {
                  raiseTicketModel.description = e;
                }
              }}
            />
          </Textarea>
          <FormControlError>
            <FormControlErrorText>
              {isFormFieldInValid("description", errors)}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
        <FormControl>
          <HStack className="justify-between mt-2 mb-1">
            <Text className="font-medium">Asset Images</Text>
            <Text className="text-gray-500">{assetImages.length}/3</Text>
          </HStack>
          {assetImages.map((uri, index) => (
            <HStack
              key={index}
              className="bg-white p-3 rounded-md justify-between mt-2"
            >
              <Text className="font-medium">{getFileName(uri)}</Text>
              <AntIcon
                onPress={() => {
                  setAssetImages((prevState) => {
                    prevState.splice(index, 1);
                    return [...prevState];
                  });
                }}
                name="close"
                className="ms-2"
                color="black"
                size={18}
              />
            </HStack>
          ))}
          {assetImages.length < 3 && (
            <Button
              className="bg-white mt-4"
              onPress={() => toggleImagePicker()}
            >
              <ButtonText className="text-black">Upload Image</ButtonText>
              <FeatherIcon
                name="upload"
                className="ms-2"
                color="black"
                size={18}
              />
            </Button>
          )}
        </FormControl>
        {/* <FormControl>
          <FormControlLabel className="mb-1">
            <FormControlLabelText>Asset Images</FormControlLabelText>
          </FormControlLabel>
          {assetImage ? (
            <View>
              <Image
                source={{ uri: assetImage }}
                className="w-full h-36 rounded-xl absolute"
              />
              <View className="w-full  flex justify-center items-center gap-4 h-36 bg-black/40 rounded-xl">
                <Button
                  className="bg-secondary-950 w-36"
                  onPress={() => toggleImagePicker()}
                >
                  <ButtonText>Choose</ButtonText>
                  <Icon
                    name="upload"
                    className="ms-2"
                    color="white"
                    size={18}
                  />
                </Button>
              </View>
            </View>
          ) : (
            <View className="w-full flex justify-center items-center gap-4 h-36 bg-white rounded-xl">
              <Button
                className="bg-secondary-950 w-36"
                onPress={() => toggleImagePicker()}
              >
                <ButtonText>Choose</ButtonText>
                <Icon name="upload" className="ms-2" color="white" size={18} />
              </Button>
            </View>
          )}
        </FormControl> */}

        <SubmitButton
          btnText="Raise"
          onPress={raiseTicket}
          isLoading={isLoading}
        />
      </VStack>
      <ImagePickerComponent
        onImagePicked={(uri) => {
          setAssetImages((prevState) => [...prevState, uri]);
        }}
        setIsModalVisible={setIsModalVisible}
        bottomSheetRef={bottomSheetRef}
      />
    </GestureHandlerRootView>
  );
};

export default RaiseTicketScreen;
