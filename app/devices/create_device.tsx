import { View, ScrollView, Text, Switch } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import PrimaryTextFormField from "@/components/fields/PrimaryTextFormField";
import { DropdownModel, ErrorModel } from "@/models/common";
import {
  AssetMasterListItemModel,
  AssetModelListItemModel,
  AssetTypeListItemModel,
} from "@/models/assets";
import {
  AssetsDropdownType,
  CommonDropdownType,
  TextCase,
} from "@/enums/enums";
import ConfigurationDropdownFormField from "@/components/fields/ConfigurationDropdownFormField";
import {
  ASSET_IMPACT,
  ASSET_LICENCED_TYPE,
  ASSET_UNIQUE_IDENTIFIER_TYPE,
} from "@/constants/configuration_keys";
import PrimaryDropdownFormField from "@/components/fields/PrimaryDropdownFormField";
import {
  CREATE_ASSET,
  GET_ASSET_MODELS_BY_ASSET_TYPE,
  GET_ASSET_TYPES_BY_NAME_SEARCH,
  GET_ORG_USERS,
} from "@/constants/api_endpoints";
import api from "@/services/api";
import PrimaryDatetimePickerFormField from "@/components/fields/PrimaryDatetimePickerFormField";
import SubmitButton from "@/components/SubmitButton";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import useRefresh from "@/hooks/useRefresh";
import { OrgUserListItemModel, UserDetailsModel } from "@/models/users";
import { EmployeeDetailsModel } from "@/models/employees";
import PrimaryTypeheadFormField from "@/components/fields/PrimaryTypeheadFormField";
import { AutocompleteDropdownItem } from "react-native-autocomplete-dropdown";

const CreateDevice = () => {
  const [errors, setErrors] = useState<ErrorModel[]>([]);

  // can validate fields
  const [canValidateField, setCanValidateField] = useState(false);

  const [fieldValidationStatus, setFieldValidationStatus] = useState<any>({});

  const [assetModel, setAssetModel] = useState<AssetMasterListItemModel>({});

  const setFieldValidationStatusFunc = (
    fieldName: string,
    isValid: boolean,
  ) => {
    if (fieldValidationStatus[fieldName]) {
      fieldValidationStatus[fieldName](isValid);
    }
  };

  const [assetTypes, setAssetTypes] = useState<AssetTypeListItemModel[]>([]);
  const [selectedAssetType, setSelectedAssetType] = useState<DropdownModel>({});

  const [assetModels, setAssetModels] = useState<AssetModelListItemModel[]>([]);
  const [selectedAssetModel, setSelectedAssetModel] = useState<DropdownModel>(
    {},
  );

  const [usersList, setUsersList] = useState<EmployeeDetailsModel[]>([]);
  const [selectedAssignToUser, setSelectedAssignToUser] =
    useState<AutocompleteDropdownItem>();

  const [asWarranty, setAsWarranty] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const { triggerRefresh } = useRefresh();

  useEffect(() => {
    const fetchAssetTypes = () => {
      api
        .get(GET_ASSET_TYPES_BY_NAME_SEARCH, {})
        .then((response) => {
          setAssetTypes(response.data?.data ?? []);
        })
        .catch((e) => {
          console.error(e);
        });
    };
    fetchAssetTypes();
  }, []);

  const getSuggestionsUrl = (type: CommonDropdownType) => {
    switch (type) {
      case CommonDropdownType.org_user:
        return GET_ORG_USERS;
    }
  };

  const onClearPress = useCallback((type: CommonDropdownType) => {
    switch (type) {
      case CommonDropdownType.org_user:
        setUsersList([]);
        break;
    }
  }, []);

  const setSuggestions = (type: CommonDropdownType, suggestionsList: any) => {
    switch (type) {
      case CommonDropdownType.org_user:
        setUsersList(
          suggestionsList.map((item: EmployeeDetailsModel) => {
            const id = item.id;
            const title = item.firstName ?? "-" + item.lastName ?? "";
            if (id && title) {
              return {
                id: id,
                title: title.toString(),
                data: item,
              };
            }
          }),
        );
        break;
    }
  };

  const getSuggestions = useCallback(
    async (
      q: string,
      type: CommonDropdownType,
      setLoading: any,
      param?: string,
    ) => {
      if (typeof q !== "string" || q.length < 3) {
        onClearPress(type);
        return;
      }
      setLoading(true);

      const url =
        getSuggestionsUrl(type) +
        `?name=${q}${(param ?? "").length > 0 ? `&${param}` : ""}`;

      console.log("url", url);

      api
        .get(url)
        .then((response) => {
          setSuggestions(type, response.data?.data ?? []);
          setLoading(false);
        })
        .catch((e) => {
          console.error(e);
          setLoading(false);
        });
    },
    [],
  );

  const fetchAssetModels = (assetTypeId: string) => {
    api
      .get(
        GET_ASSET_MODELS_BY_ASSET_TYPE + `?name=&assetTypeIds=${[assetTypeId]}`,
        {},
      )
      .then((response) => {
        setAssetModels(response.data?.data ?? []);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const onItemSelect = (type: any, e: any) => {
    switch (type) {
      case AssetsDropdownType.asset_type:
        let iSelectedAssetType = assetTypes.find(
          (assetType) => assetType.id === e,
        );
        setSelectedAssetType({
          label: iSelectedAssetType?.name,
          value: iSelectedAssetType?.id,
        });
        fetchAssetModels(iSelectedAssetType?.id ?? "");
        break;
      case AssetsDropdownType.asset_model:
        let iSelectedAssetModel = assetModels.find(
          (assetModel) => assetModel.id === e,
        );
        setSelectedAssetModel({
          label: iSelectedAssetModel?.modelName,
          value: iSelectedAssetModel?.id,
        });
        break;
    }
  };

  const createDevice = async () => {
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
      setAssetModel((prev) => {
        prev.assetTypeId = selectedAssetType.value;
        prev.assetModelId = selectedAssetModel.value;
        prev.asWarranty = asWarranty;
        prev.assignedTo = selectedAssignToUser?.id;
        return prev;
      });

      setIsLoading(true);

      setErrors([]);

      api
        .post(CREATE_ASSET, assetModel)
        .then((response) => {
          // router.push({pathname: ""});
          console.log(response.data.data);
          Toast.show({
            type: "success",
            text1: "Device added successfully",
            // text2: "Crendential have been sent to your email",
          });
          setIsLoading(false);
          triggerRefresh();
          setAssetModel({});
          router.back();
        })
        .catch((e) => {
          console.error(e.response?.data);
          let errors = e.response?.data?.errors;
          if (errors) {
            console.error("errors -> ", errors);
            setErrors(errors);
          }
          setIsLoading(false);
        });
    }
  };

  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets={true}
      className="h-full bg-white"
    >
      <View className="p-4 mb-12">
        <PrimaryTextFormField
          className="mb-3"
          fieldName="serialNo"
          label="Serial No."
          placeholder="Enter here"
          errors={errors}
          setErrors={setErrors}
          min={5}
          max={50}
          defaultValue={assetModel.serialNo}
          textCase={TextCase.uppercase}
          filterExp={/^[a-zA-Z0-9]*$/}
          canValidateField={canValidateField}
          setCanValidateField={setCanValidateField}
          setFieldValidationStatus={setFieldValidationStatus}
          validateFieldFunc={setFieldValidationStatusFunc}
          onChangeText={(value) => {
            setAssetModel((prevState) => {
              prevState.serialNo = value;
              return prevState;
            });
          }}
        />
        <PrimaryTextFormField
          className="mb-3"
          fieldName="purchaseId"
          label="Purchase Id"
          placeholder="Enter here"
          errors={errors}
          setErrors={setErrors}
          min={5}
          max={50}
          defaultValue={assetModel.purchaseId}
          textCase={TextCase.uppercase}
          filterExp={/^[a-zA-Z0-9]*$/}
          canValidateField={canValidateField}
          setCanValidateField={setCanValidateField}
          setFieldValidationStatus={setFieldValidationStatus}
          validateFieldFunc={setFieldValidationStatusFunc}
          onChangeText={(value) => {
            setAssetModel((prevState) => {
              prevState.purchaseId = value;
              return prevState;
            });
          }}
        />
        <ConfigurationDropdownFormField
          className="mb-3"
          configurationCategory={ASSET_UNIQUE_IDENTIFIER_TYPE}
          placeholder="Select unique identifier type"
          label="Unique Identifier Type"
          errors={errors}
          setErrors={setErrors}
          fieldName="uniqueIdentifierType"
          canValidateField={canValidateField}
          setCanValidateField={setCanValidateField}
          setFieldValidationStatus={setFieldValidationStatus}
          validateFieldFunc={setFieldValidationStatusFunc}
          onItemSelect={(config) => {
            setAssetModel((prevState) => {
              prevState.uniqueIdentifierType = config.id;
              return prevState;
            });
          }}
        />
        <PrimaryTextFormField
          className="mb-3"
          fieldName="uniqueIdentifier"
          label="Unique Identifier"
          placeholder="Enter here"
          errors={errors}
          setErrors={setErrors}
          min={4}
          max={50}
          defaultValue={assetModel.uniqueIdentifier}
          textCase={TextCase.uppercase}
          filterExp={/^[a-zA-Z0-9]*$/}
          canValidateField={canValidateField}
          setCanValidateField={setCanValidateField}
          setFieldValidationStatus={setFieldValidationStatus}
          validateFieldFunc={setFieldValidationStatusFunc}
          onChangeText={(value) => {
            setAssetModel((prevState) => {
              prevState.uniqueIdentifier = value;
              return prevState;
            });
          }}
        />
        <PrimaryDropdownFormField
          className="mb-3"
          options={assetTypes.map((assetType) => ({
            label: assetType.name?.toString(),
            value: assetType.id,
          }))}
          selectedValue={selectedAssetType}
          setSelectedValue={setSelectedAssetType}
          type={AssetsDropdownType.asset_type}
          placeholder="Select asset type"
          fieldName="assetTypeId"
          label="Asset Type"
          canValidateField={canValidateField}
          setCanValidateField={setCanValidateField}
          setFieldValidationStatus={setFieldValidationStatus}
          validateFieldFunc={setFieldValidationStatusFunc}
          errors={errors}
          setErrors={setErrors}
          onItemSelect={onItemSelect}
        />
        <PrimaryDropdownFormField
          className="mb-3"
          options={assetModels.map((assetModel) => ({
            label: assetModel.modelName?.toString(),
            value: assetModel.id,
          }))}
          selectedValue={selectedAssetModel}
          setSelectedValue={setSelectedAssetModel}
          type={AssetsDropdownType.asset_model}
          placeholder="Select asset model"
          fieldName="assetModelId"
          label="Asset Model"
          canValidateField={canValidateField}
          setCanValidateField={setCanValidateField}
          setFieldValidationStatus={setFieldValidationStatus}
          validateFieldFunc={setFieldValidationStatusFunc}
          errors={errors}
          setErrors={setErrors}
          onItemSelect={onItemSelect}
        />
        <ConfigurationDropdownFormField
          className="mb-3"
          configurationCategory={ASSET_LICENCED_TYPE}
          placeholder="Select license type"
          label="License Type"
          errors={errors}
          setErrors={setErrors}
          fieldName="licensedType"
          canValidateField={canValidateField}
          setCanValidateField={setCanValidateField}
          setFieldValidationStatus={setFieldValidationStatus}
          validateFieldFunc={setFieldValidationStatusFunc}
          onItemSelect={(config) => {
            setAssetModel((prevState) => {
              prevState.licensedType = config.id;
              return prevState;
            });
          }}
        />
        <ConfigurationDropdownFormField
          className="mb-3"
          configurationCategory={ASSET_IMPACT}
          placeholder="Select impact"
          label="Impact"
          errors={errors}
          setErrors={setErrors}
          fieldName="impact"
          canValidateField={canValidateField}
          setCanValidateField={setCanValidateField}
          setFieldValidationStatus={setFieldValidationStatus}
          validateFieldFunc={setFieldValidationStatusFunc}
          onItemSelect={(config) => {
            setAssetModel((prevState) => {
              prevState.impact = config.id;
              return prevState;
            });
          }}
        />
        <PrimaryDatetimePickerFormField
          label="OME Warranty Date"
          fieldName="oemWarrantyDate"
          errors={errors}
          setErrors={setErrors}
          canValidateField={canValidateField}
          setCanValidateField={setCanValidateField}
          setFieldValidationStatus={setFieldValidationStatus}
          validateFieldFunc={setFieldValidationStatusFunc}
          placeholder="Select ome warranty date"
          className="mb-3"
          onSelect={(value) => {
            setAssetModel((prevState) => {
              prevState.oemWarrantyDate = value;
              return prevState;
            });
          }}
        />
        <PrimaryDatetimePickerFormField
          className="mb-4"
          label="Extended Warranty Date"
          fieldName="extendedWarrantyDate"
          errors={errors}
          setErrors={setErrors}
          canValidateField={canValidateField}
          setCanValidateField={setCanValidateField}
          setFieldValidationStatus={setFieldValidationStatus}
          validateFieldFunc={setFieldValidationStatusFunc}
          placeholder="Select extended warranty date"
          onSelect={(value) => {
            setAssetModel((prevState) => {
              prevState.extendedWarrantyDate = value;
              return prevState;
            });
          }}
        />
        <View className=" flex-row items-center">
          <Text className="text-md font-semibold text-gray-800">
            As warranty<Text className="text-red-400 ms-0.5">*</Text>
          </Text>
          <Switch
            trackColor={{ false: "#e5e7eb", true: "#c2e2d0" }}
            thumbColor={asWarranty ? "#39a676" : "#6b7280"}
            ios_backgroundColor="#e5e7eb"
            onValueChange={() => {
              setAsWarranty((previousState) => !previousState);
              // setAssetModel((prev) => {
              //   prev.asWarranty = !asWarranty;
              //   return prev;
              // });
            }}
            value={asWarranty}
            className="ms-2"
          />
        </View>
        <View className="mt-6">
          <Text className="font-bold text-lg">Assignment Details</Text>
          {/* <PrimaryDropdownFormField
            className="my-3"
            options={usersList.map((user) => ({
              label: user.firstName ?? "-" + user.lastName ?? "",
              value: user.id,
            }))}
            selectedValue={selectedAssignToUser}
            setSelectedValue={setSelectedAssignToUser}
            type={CommonDropdownType.org_user}
            placeholder="Select assign to"
            fieldName="assignedTo"
            label="Assign To"
            canValidateField={canValidateField}
            setCanValidateField={setCanValidateField}
            setFieldValidationStatus={setFieldValidationStatus}
            validateFieldFunc={setFieldValidationStatusFunc}
            errors={errors}
            setErrors={setErrors}
            onItemSelect={onItemSelect}
          /> */}
          <View className="mt-2" />
          <PrimaryTypeheadFormField
            type={CommonDropdownType.org_user}
            onClearPress={onClearPress}
            selectedValue={selectedAssignToUser}
            suggestions={usersList}
            getSuggestions={getSuggestions}
            setSelectedValue={setSelectedAssignToUser}
            placeholder="Search assign to"
            fieldName="assignedTo"
            label="Assign To"
            errors={errors}
            setErrors={setErrors}
            canValidateField={canValidateField}
            setCanValidateField={setCanValidateField}
            setFieldValidationStatus={setFieldValidationStatus}
            validateFieldFunc={setFieldValidationStatusFunc}
            backgroundColor="#fff"
          />
        </View>
        <SubmitButton
          isLoading={isLoading}
          onPress={createDevice}
          btnText="Create"
        />
      </View>
    </ScrollView>
  );
};

export default CreateDevice;
