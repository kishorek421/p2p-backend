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
import { FormControl } from "@/components/ui/form-control";
import { DropdownModel, ErrorModel } from "@/models/common";
import { getFileName } from "@/utils/helper";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Pressable, ScrollView, Text, View, Image } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import FeatherIcon from "react-native-vector-icons/Feather";
import AntDesign from "react-native-vector-icons/AntDesign";
import { RaiseTicketRequestModel } from "@/models/tickets";
import api from "@/services/api";
import { HStack } from "@/components/ui/hstack";
import SubmitButton from "@/components/SubmitButton";
import ImagePickerComponent from "@/components/ImagePickerComponent";
import Toast from "react-native-toast-message";
import PrimaryDropdownFormField from "@/components/fields/PrimaryDropdownFormField";
import PrimaryTextareaFormField from "@/components/fields/PrimaryTextareaFormField";

const RaiseTicketScreen = () => {
  const [assetsInUse, setAssetsInUse] = useState<AssetInUseListItemModel[]>([]);
  const [issueTypes, setIssueTypes] = useState<IssueTypeListItemModel[]>([]);
  const [errors, setErrors] = useState<ErrorModel[]>([]);

  const { customerId } = useLocalSearchParams();

  const [selectedAssetInUse, setSelectedAssetInUse] = useState<DropdownModel>(
    {},
  );
  const [selectedIssueType, setSelectedIssueType] = useState<DropdownModel>({});

  const [assetImages, setAssetImages] = useState<string[]>([]);

  const bottomSheetRef = useRef(null);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [raiseTicketModel, setRaiseTicketModel] =
    useState<RaiseTicketRequestModel>({});

  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  // can validate fields
  const [canValidateField, setCanValidateField] = useState(false);

  const [fieldValidationStatus, setFieldValidationStatus] = useState<any>({});

  const setFieldValidationStatusFunc = (
    fieldName: string,
    isValid: boolean,
  ) => {
    if (fieldValidationStatus[fieldName]) {
      fieldValidationStatus[fieldName](isValid);
    }
  };

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

  const onItemSelect = (type: string, e: any) => {
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

  const raiseTicket = async () => {
    const validationPromises = Object.keys(fieldValidationStatus).map(
      (key) =>
        new Promise((resolve) => {
          // Resolve each validation status based on field key
          setFieldValidationStatus((prev: any) => ({
            ...prev,
            [key]: resolve,
          }));
        }),
    );

    setCanValidateField(true);

    // Wait for all validations to complete
    await Promise.all(validationPromises);

    const allValid = errors
      .map((error) => error.message?.length === 0)
      .every((status) => status === true);

    if (allValid) {
      setIsLoading(true);
      raiseTicketModel.assetInUse = selectedAssetInUse?.value;
      raiseTicketModel.issueType = selectedIssueType?.value;

      const formData = new FormData();

      setIsLoading(true);

      if (assetImages.length > 0) {
        console.log(assetImages);
        for (let i = 0; i < assetImages.length; i++) {
          const assetImage = assetImages[i];
          // formData.append(
          //   "assetImages",
          //   new File([assetImage], getFileName(assetImage, true), {
          //     type: "image/jpeg",
          //   }),
          // );

          // --@ts-ignore --
          formData.append("assetImages", {
            uri: assetImage,
            type: "image/jpeg",
            name: getFileName(assetImage, true),
          } as any);
        }
      }

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
    }
  };

  return (
    <ScrollView>
      <VStack className="p-4 gap-4">
        {/* <Text className="text-gray-800 ">
          Facing issues with your laptop or PC? Let us know, and our expert
          engineers will be there to resolve it.
        </Text> */}
        <PrimaryDropdownFormField
          options={assetsInUse.map((assetInUse) => ({
            label: assetInUse.serialNo?.toString(),
            value: assetInUse.id,
          }))}
          selectedValue={selectedAssetInUse}
          setSelectedValue={setSelectedAssetInUse}
          type="assetInUse"
          placeholder="Select asset"
          fieldName="assetInUseId"
          label="Asset"
          canValidateField={canValidateField}
          setCanValidateField={setCanValidateField}
          setFieldValidationStatus={setFieldValidationStatus}
          validateFieldFunc={setFieldValidationStatusFunc}
          errors={errors}
          setErrors={setErrors}
          onItemSelect={onItemSelect}
        />
        <PrimaryDropdownFormField
          options={issueTypes.map((issueType) => ({
            label: issueType.name?.toString(),
            value: issueType.id,
          }))}
          selectedValue={selectedIssueType}
          setSelectedValue={setSelectedIssueType}
          type="issueType"
          placeholder="Select issue type"
          fieldName="issueTypeId"
          label="Issue Type"
          canValidateField={canValidateField}
          setCanValidateField={setCanValidateField}
          setFieldValidationStatus={setFieldValidationStatus}
          validateFieldFunc={setFieldValidationStatusFunc}
          errors={errors}
          setErrors={setErrors}
          onItemSelect={onItemSelect}
        />
        <PrimaryTextareaFormField
          fieldName="description"
          label="Issue Description"
          placeholder="Write a short description about your issue"
          errors={errors}
          setErrors={setErrors}
          min={10}
          max={200}
          defaultValue={raiseTicketModel.description}
          filterExp={/^[a-zA-Z0-9 ]*$/}
          onChangeText={(value: any) => {
            setRaiseTicketModel((prevState) => {
              prevState.description = value;
              return prevState;
            });
          }}
          canValidateField={canValidateField}
          setCanValidateField={setCanValidateField}
          setFieldValidationStatus={setFieldValidationStatus}
          validateFieldFunc={setFieldValidationStatusFunc}
        />
        <FormControl>
          <HStack className="justify-between mt-2 mb-1">
            <Text className="font-medium">Asset Images</Text>
            <Text className="text-gray-500">{assetImages.length}/3</Text>
          </HStack>
          <View className="flex-row flex-wrap mt-2">
            {assetImages.map((uri, index) => (
              <Pressable
                onPress={() => {
                  router.push({
                    pathname: "/image_viewer/[uri]",
                    params: {
                      uri: uri,
                    },
                  });
                }}
                className="me-3"
              >
                <View>
                  <Image
                    source={{ uri: uri }}
                    className="w-24 h-24 rounded-xl absolute"
                  />
                  <View className="w-24 flex items-end gap-4 h-24 rounded-xl">
                    <Pressable
                      className="mt-2 me-2"
                      onPress={() => {
                        // setImagePath("");
                        setAssetImages((prev) => {
                          prev.splice(index, 1);
                          return [...prev];
                        });
                      }}
                    >
                      <AntDesign name="closecircle" size={16} color="white" />
                    </Pressable>
                  </View>
                </View>
                {/* <HStack
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
              </HStack> */}
              </Pressable>
            ))}
          </View>
          {assetImages.length < 3 && (
            <Button
              className="bg-white mt-4"
              onPress={() => toggleImagePicker()}
            >
              <FeatherIcon
                name="plus-circle"
                className="me-1"
                color="black"
                size={18}
              />
              <ButtonText className="text-black">Add Image</ButtonText>
            </Button>
          )}
        </FormControl>
        <SubmitButton
          btnText="Raise"
          onPress={raiseTicket}
          isLoading={isLoading}
        />
        <View className="mt-4">
          <Text className="text-gray-600 text-semibold">Note:</Text>
          <Text className="mt-1 text-gray-600">
            Once submitted, our team will review your issue and send an engineer
            to resolve it.
          </Text>
        </View>
      </VStack>
      <ImagePickerComponent
        onImagePicked={(uri) => {
          setAssetImages((prevState) => [...prevState, uri]);
        }}
        setIsModalVisible={setIsModalVisible}
        bottomSheetRef={bottomSheetRef}
      />
    </ScrollView>
  );
};

export default RaiseTicketScreen;
