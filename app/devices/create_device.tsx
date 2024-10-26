import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AssetMasterListItemModel } from "@/models/assets";
import { DropdownModel, ErrorModel } from "@/models/common";
import Toast from "react-native-toast-message";
import api from "@/services/api";
import { Input, InputField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { router } from "expo-router";
import { VStack } from "@/components/ui/vstack";
import {
  CREATE_ASSET,
  GET_ASSET_TYPES,
  GET_ASSET_MODELS,
  GET_LICENSED_TYPES,
  GET_IMPACTS,
} from "@/constants/api_endpoints";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { FontAwesome } from "@expo/vector-icons";
import { isFormFieldInValid } from "@/utils/helper";
import PrimaryDropdownField from "@/components/fields/PrimaryDropdownField";

const CreateDevice = () => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateField, setDateField] = useState<string | null>(null);
  const [oemWarrantyDate, setOemWarrantyDate] = useState<Date | null>(null);
  const [extendedWarrantyDate, setExtendedWarrantyDate] = useState<Date | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const [raiseAssetModel, setRaiseAssetModel] =
    useState<AssetMasterListItemModel>({
      asWarranty: false,
    });

  const [assetTypes, setAssetTypes] = useState<DropdownModel[]>([]);
  const [assetModels, setAssetModels] = useState<DropdownModel[]>([]);
  const [licensedTypes, setLicensedTypes] = useState<DropdownModel[]>([]);
  const [impacts, setImpacts] = useState<DropdownModel[]>([]);
  const [errors, setErrors] = useState<ErrorModel[]>([]);
  const [selectedAssetType, setSelectedAssetType] = useState<DropdownModel>();
  const [selectedAssetModel, setSelectedAssetModel] = useState<DropdownModel>();
  const [selectedLicensedType, setSelectedLicensedType] =
    useState<DropdownModel>();
  const [selectedImpact, setSelectedImpact] = useState<DropdownModel>();

  const loadDropdowns = async () => {
    try {
      const [
        assetTypeResponse,
        assetModelResponse,
        licensedTypeResponse,
        impactResponse,
      ] = await Promise.all([
        api.get(GET_ASSET_TYPES),
        api.get(GET_ASSET_MODELS),
        api.get(GET_LICENSED_TYPES),
        api.get(GET_IMPACTS),
      ]);

      // Ensure data exists before setting state
      setAssetTypes(assetTypeResponse.data?.data || []);
      setAssetModels(assetModelResponse.data?.data || []);
      setLicensedTypes(licensedTypeResponse.data?.data || []);
      setImpacts(impactResponse.data?.data || []);
    } catch (error) {
      console.error("Error loading dropdowns:", error);
    }
  };

  const onChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (dateField === "oemWarrantyDate") {
        setOemWarrantyDate(selectedDate);
      } else if (dateField === "extendedWarrantyDate") {
        setExtendedWarrantyDate(selectedDate);
      }
    }
  };

  const handleToggleWarranty = () => {
    setRaiseAssetModel((prev) => ({
      ...prev,
      asWarranty: !prev.asWarranty,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const assetData = {
        ...raiseAssetModel,
        oemWarrantyDate,
        extendedWarrantyDate,
      };

      const formData = new FormData();
      formData.append("serialNo", assetData.serialNo ?? "");
      formData.append("purchaseId", assetData.purchaseId ?? "");
      formData.append("uniqueIdentifier", assetData.uniqueIdentifier ?? "");
      formData.append(
        "oemWarrantyDate",
        oemWarrantyDate ? oemWarrantyDate.toISOString() : "",
      );
      formData.append(
        "extendedWarrantyDate",
        extendedWarrantyDate ? extendedWarrantyDate.toISOString() : "",
      );
      formData.append("asWarranty", assetData.asWarranty ? "true" : "false");

      await api.post(CREATE_ASSET, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Toast.show({
        type: "success",
        text1: "Device added successfully",
      });
      router.back();
    } catch (error) {
      console.error("Error creating asset:", error);
      Toast.show({
        type: "error",
        text1: "Failed to add device",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormItem = ({ item }: { item: string }) => {
    switch (item) {
      case "serialNo":
        return (
          <View className="p-4 mt-8 ">
            <FormControl>
              <FormControlLabel className="mb-1">
                <FormControlLabelText>
                  {item.replace(/([A-Z])/g, " $1")}
                </FormControlLabelText>
              </FormControlLabel>
              <Input variant="outline" size="md">
                <InputField
                  className="text-sm h-8"
                  placeholder=""
                  onChangeText={(text) =>
                    setRaiseAssetModel((prev) => ({ ...prev, [item]: text }))
                  } // Update here
                />
              </Input>
            </FormControl>
          </View>
        );
      case "purchaseId":
      case "uniqueIdentifier":
        return (
          <View className="p-4 ">
            <FormControl>
              <FormControlLabel className="mb-1">
                <FormControlLabelText>
                  {item.replace(/([A-Z])/g, " $1")}
                </FormControlLabelText>
              </FormControlLabel>
              <Input variant="outline" size="md">
                <InputField
                  className="text-sm h-8"
                  placeholder=""
                  onChangeText={(text) =>
                    setRaiseAssetModel((prev) => ({ ...prev, [item]: text }))
                  } // Update here
                />
              </Input>
            </FormControl>
          </View>
        );

      case "uniqueIdentifierType":
        return (
          <View className="p-4">
            <FormControl
              isInvalid={
                isFormFieldInValid("uniqueIdentifierType", errors).length > 0
              }
            >
              <FormControlLabel className="mb-1">
                <FormControlLabelText>
                  Unique Identifier Type
                </FormControlLabelText>
              </FormControlLabel>
              <PrimaryDropdownField
                options={assetTypes}
                selectedValue={selectedAssetType}
                placeholder=""
                onChange={(value) =>
                  setSelectedAssetType(value as DropdownModel)
                }
                type="assetType"
              />
              <FormControlError>
                <FormControlErrorText>
                  {isFormFieldInValid("uniqueIdentifierType", errors)}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          </View>
        );

      case "assetType":
        return (
          <View className="p-4">
            <FormControl
              isInvalid={isFormFieldInValid("asset_Type", errors).length > 0}
            >
              <FormControlLabel className="mb-1">
                <FormControlLabelText>Asset Type</FormControlLabelText>
              </FormControlLabel>
              <PrimaryDropdownField
                options={assetTypes}
                selectedValue={selectedAssetType}
                placeholder=""
                onChange={(value) =>
                  setSelectedAssetType(value as DropdownModel)
                }
                type="assetType"
              />
              <FormControlError>
                <FormControlErrorText>
                  {isFormFieldInValid("asset_Type", errors)}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          </View>
        );

      case "assetModel":
        return (
          <View className="p-4">
            <FormControl
              isInvalid={isFormFieldInValid("assetModel", errors).length > 0}
            >
              <FormControlLabel className="mb-1">
                <FormControlLabelText>Asset Model</FormControlLabelText>
              </FormControlLabel>
              <PrimaryDropdownField
                options={assetModels}
                selectedValue={selectedAssetModel}
                placeholder=""
                onChange={(value) =>
                  setSelectedAssetModel(value as DropdownModel)
                }
                type="assetModel"
              />
              <FormControlError>
                <FormControlErrorText>
                  {isFormFieldInValid("assetModel", errors)}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          </View>
        );

      case "licensedType":
        return (
          <View className="p-4">
            <FormControl
              isInvalid={isFormFieldInValid("licensedType", errors).length > 0}
            >
              <FormControlLabel className="mb-1">
                <FormControlLabelText>Licensed Type</FormControlLabelText>
              </FormControlLabel>
              <PrimaryDropdownField
                options={licensedTypes}
                selectedValue={selectedLicensedType}
                placeholder=""
                onChange={(value) =>
                  setSelectedLicensedType(value as DropdownModel)
                }
                type="licensedType"
              />
              <FormControlError>
                <FormControlErrorText>
                  {isFormFieldInValid("licensedType", errors)}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          </View>
        );

      case "impact":
        return (
          <View className="p-4">
            <FormControl
              isInvalid={isFormFieldInValid("impact", errors).length > 0}
            >
              <FormControlLabel className="mb-1">
                <FormControlLabelText>Impact</FormControlLabelText>
              </FormControlLabel>
              <PrimaryDropdownField
                options={impacts}
                selectedValue={selectedImpact}
                placeholder=""
                onChange={(value) => setSelectedImpact(value as DropdownModel)}
                type="impact"
              />
              <FormControlError>
                <FormControlErrorText>
                  {isFormFieldInValid("impact", errors)}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          </View>
        );

      case "oemWarrantyDate":
        return (
          <View className="p-4">
            <Text className="font-semibold mb-2">OEM Warranty Date</Text>
            <View className="flex-row items-center p-3 border border-gray-300 rounded-md">
              {/* Text Field (Static, no onPress) */}
              <Text className="flex-1 mr-64 text-gray-600">
                {oemWarrantyDate ? oemWarrantyDate.toDateString() : " "}
              </Text>

              <TouchableOpacity
                className="mr-2"
                onPress={() => {
                  setShowDatePicker(true);
                  setDateField("oemWarrantyDate");
                }}
              >
                <FontAwesome name="calendar" size={20} color="gray" />
              </TouchableOpacity>
            </View>
          </View>
        );

      case "extendedWarrantyDate":
        return (
          <View className="p-4">
            <Text className="font-semibold mb-2">Extended Warranty Date</Text>
            <View className="flex-row items-center p-3 border border-gray-300 rounded-md">
              <Text className="flex-1 mr-64 text-gray-600">
                {extendedWarrantyDate
                  ? extendedWarrantyDate.toDateString()
                  : ""}
              </Text>
              {/* Calendar Icon (Triggers Date Picker) */}
              <TouchableOpacity
                className="mr-2"
                onPress={() => {
                  setShowDatePicker(true); // Show date picker
                  setDateField("extendedWarrantyDate"); // Specify the field
                }}
              >
                <FontAwesome name="calendar" size={20} color="gray" />
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <VStack className="flex-1 bg-white">
      <ScrollView>
        <FlatList
          data={[
            "serialNo",
            "purchaseId",
            "uniqueIdentifier",
            "uniqueIdentifierType",
            "assetType",
            "assetModel",
            "licensedType",
            "impact",
            "oemWarrantyDate",
            "extendedWarrantyDate",
          ]}
          renderItem={renderFormItem}
          keyExtractor={(item) => item}
        />
        <View className="  justify-between p-4">
          <Text>As Warranty</Text>
          <Switch
            className=" mr-96"
            value={raiseAssetModel.asWarranty}
            onValueChange={handleToggleWarranty}
          />
        </View>
        <FormControl>
          <Button
            className="bg-green-600 mx-4 mt-2 mb-6 "
            onPress={handleSubmit}
          >
            <Text className="text-white text-center">Add Device</Text>
          </Button>
        </FormControl>
      </ScrollView>
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}
    </VStack>
  );
};

export default CreateDevice;
