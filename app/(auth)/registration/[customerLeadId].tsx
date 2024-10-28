import { ScrollView, Text, View } from "react-native";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import React, { useCallback, useEffect, useRef, useState } from "react";
import api from "@/services/api";
import {
  CREATE_CUSTOMER,
  GET_AREAS_LIST_BY_NAME_SEARCH,
  GET_CUSTOMER_LEAD_DETAILS,
  GET_PINCODES_LIST_BY_PINCODE_SEARCH,
} from "@/constants/api_endpoints";
import {
  CATEGORY_OF_ORG,
  CUSTOMER_LEAD_ACTIVE,
  SIZE_OF_ORG,
  TYPE_OF_ORG,
} from "@/constants/configuration_keys";
import ConfigurationDropdownFormField from "@/components/fields/ConfigurationDropdownFormField";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { AreaListItemModel, PincodeListItemModel } from "@/models/geolocations";
import { ApiResponseModel, ErrorModel } from "@/models/common";
import { CustomerLeadDetailsModel } from "@/models/customers";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getFileName, isFormFieldInValid } from "@/utils/helper";
import LoadingBar from "@/components/LoadingBar";
import { AutocompleteDropdownItem } from "react-native-autocomplete-dropdown";
import { GeoLocationType, TextCase } from "@/enums/enums";
import SubmitButton from "@/components/SubmitButton";
import PrimaryTextFormField from "@/components/fields/PrimaryTextFormField";
import PrimaryTypeheadFormField from "@/components/fields/PrimaryTypeheadFormField";
import { DropdownItemModel } from "@/models/ui/dropdown_item_model";
import ImageFormField from "@/components/fields/ImageFormField";
import PrimaryTextareaFormField from "@/components/fields/PrimaryTextareaFormField";
import { AUTH_TOKEN_KEY } from "@/constants/storage_keys";
import { getItem } from "expo-secure-store";
import Toast from "react-native-toast-message";

const RegistrationScreen = () => {
  const { customerLeadId } = useLocalSearchParams();

  // geolocations
  const [pincodes, setPincodes] = useState<DropdownItemModel[]>([]);
  const [areas, setAreas] = useState<DropdownItemModel[]>([]);
  const [cities, setCities] = useState<DropdownItemModel[]>([]);
  const [states, setStates] = useState<DropdownItemModel[]>([]);
  const [countries, setCountries] = useState<DropdownItemModel[]>([]);

  // geolocations
  const [selectedPincode, setSelectedPincode] =
    useState<AutocompleteDropdownItem>();
  const [selectedArea, setSelectedArea] = useState<AutocompleteDropdownItem>();
  const [selectedCity, setSelectedCity] = useState<AutocompleteDropdownItem>();
  const [selectedState, setSelectedState] =
    useState<AutocompleteDropdownItem>();
  const [selectedCountry, setSelectedCountry] =
    useState<AutocompleteDropdownItem>();

  const [customerLeadDetailsModel, setCustomerLeadDetailsModel] =
    useState<CustomerLeadDetailsModel>({});

  const router = useRouter();

  const [isLead, setIsLead] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [errors, setErrors] = useState<ErrorModel[]>([]);

  const [orgImage, setOrgImage] = useState<string>("");

  // can validate fields
  const [canValidateField, setCanValidateField] = useState(false);

  const [fieldValidationStatus, setFieldValidationStatus] = useState<any>({});

  const getGeoLocationSuggestionsUrl = (type: GeoLocationType) => {
    switch (type) {
      case GeoLocationType.PINCODE:
        return GET_PINCODES_LIST_BY_PINCODE_SEARCH;
      case GeoLocationType.AREA:
        return GET_AREAS_LIST_BY_NAME_SEARCH;
      default:
        return "";
    }
  };

  const getSuggestions = useCallback(
    async (q: string, type: GeoLocationType, setLoading: any) => {
      if (typeof q !== "string" || q.length < 3) {
        onClearPress(type);
        return;
      }
      setLoading(true);

      api
        .get(getGeoLocationSuggestionsUrl(type) + `?q=${q}`)
        .then((response) => {
          setGeolocationSuggestions(type, response.data?.data ?? []);
          setLoading(false);
        })
        .catch((e) => {
          console.error(e);
          setLoading(false);
        });

      setLoading(false);
    },
    [],
  );

  const onClearPress = useCallback((type: GeoLocationType) => {
    switch (type) {
      case GeoLocationType.PINCODE:
        setPincodes([]);
        setAreas([]);
        setCities([]);
        setStates([]);
        setCountries([]);
        break;
      case GeoLocationType.AREA:
        setAreas([]);
        break;
    }
  }, []);

  const setGeolocationSuggestions = (
    type: GeoLocationType,
    suggestionsList: any,
  ) => {
    switch (type) {
      case GeoLocationType.PINCODE:
        setPincodes(
          suggestionsList.map((item: PincodeListItemModel) => {
            const id = item.id;
            const title = item.pincode;
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
      case GeoLocationType.AREA:
        setAreas(
          suggestionsList.map((item: AreaListItemModel) => {
            const id = item.id;
            const title = item.areaName;
            if (id && title) {
              return {
                id: id,
                title: title,
              };
            }
          }),
        );
        break;
    }
  };

  const onItemSelect = (type: GeoLocationType, item: DropdownItemModel) => {
    switch (type) {
      case GeoLocationType.PINCODE:
        const cityId = item.data?.cityId;
        const cityName = item.data?.cityName;
        if (cityId && cityName) {
          setCities([
            {
              title: cityName,
              id: cityId,
            },
          ]);
          setSelectedCity({
            title: cityName,
            id: cityId,
          });
        }
        // set state
        const stateId = item.data?.stateId;
        const stateName = item.data?.stateName;
        if (stateId && stateName) {
          setStates([
            {
              title: stateName,
              id: stateId,
            },
          ]);
          setSelectedState({
            title: stateName,
            id: stateId,
          });
        }
        // set country
        const countryId = item.data?.countryId;
        const countryName = item.data?.countryName;
        if (countryId && countryName) {
          setCountries([
            {
              title: countryName,
              id: countryId,
            },
          ]);
          setSelectedCountry({
            title: countryName,
            id: countryId,
          });
        }
        break;
    }
  };

  useEffect(() => {
    // customer lead details
    const loadCustomerLeadDetails = () => {
      api
        .get<ApiResponseModel<CustomerLeadDetailsModel>>(
          GET_CUSTOMER_LEAD_DETAILS,
        )
        .then((response) => {
          let data = response.data.data ?? {};
          if (data && data.id) {
            let leadStatus = data.onBoardingStatusDetails?.key;

            if (leadStatus === CUSTOMER_LEAD_ACTIVE) {
              router.replace({ pathname: "./home" });
            }

            if (data.orgImage) {
              setOrgImage(data.orgImage);
            }

            setCustomerLeadDetailsModel(data);
            setIsLead(true);

            setPincodes([
              {
                title: (data.pincodeDetails?.pincode ?? "").toString(),
                id: data.pincodeDetails?.id ?? "",
              },
            ]);
            setSelectedPincode({
              title: (data.pincodeDetails?.pincode ?? "").toString(),
              id: data.pincodeDetails?.id ?? "",
            });
            setAreas([
              {
                title: data.areaDetails?.areaName ?? "",
                id: data.areaDetails?.id ?? "",
              },
            ]);
            setSelectedArea({
              title: data.areaDetails?.areaName ?? "",
              id: data.areaDetails?.id ?? "",
            });
            setCities([
              {
                title: data.cityDetails?.cityName ?? "",
                id: data.cityDetails?.id ?? "",
              },
            ]);
            setSelectedCity({
              title: data.cityDetails?.cityName ?? "",
              id: data.cityDetails?.id ?? "",
            });
            setStates([
              {
                title: data.stateDetails?.stateName ?? "",
                id: data.stateDetails?.id ?? "",
              },
            ]);
            setSelectedState({
              title: data.stateDetails?.stateName ?? "",
              id: data.stateDetails?.id ?? "",
            });
            setCountries([
              {
                title: data.countryDetails?.countryName ?? "",
                id: data.countryDetails?.id ?? "",
              },
            ]);
            setSelectedCountry({
              title: data.countryDetails?.countryName ?? "",
              id: data.countryDetails?.id ?? "",
            });
            setIsLoading(false);
          }
        })
        .catch((e) => {
          console.error(e);
          setIsLoading(false);
          setIsLead(false);
        });
    };

    // load customer lead details
    loadCustomerLeadDetails();
  }, [router]);

  const updateCustomerLeadDetails = async () => {
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

      customerLeadDetailsModel.pincodeId = selectedPincode?.id ?? "";
      customerLeadDetailsModel.areaId = selectedArea?.id ?? "";
      customerLeadDetailsModel.cityId = selectedCity?.id ?? "";
      customerLeadDetailsModel.stateId = selectedState?.id ?? "";
      customerLeadDetailsModel.countryId = selectedCountry?.id ?? "";
      customerLeadDetailsModel.isCustomerLead = isLead;
      customerLeadDetailsModel.customerLeadId = customerLeadDetailsModel.id;

      const formData = new FormData();
      (
        Object.keys(
          customerLeadDetailsModel,
        ) as (keyof CustomerLeadDetailsModel)[]
      ).forEach((key) => {
        const value = customerLeadDetailsModel[key];
        if (value !== undefined && value !== null) {
          formData.append(key as string, value as any); // Type assertion here
        }
      });

      if (orgImage) {
        // --@ts-ignore --
        formData.append("orgImageFile", {
          uri: orgImage,
          type: "image/jpg",
          name: getFileName(orgImage, true),
        } as any);
      }

      setErrors([]);

      api
        .post(CREATE_CUSTOMER, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(async (response) => {
          // router.push({pathname: ""});
          console.log(response.data.data);
          const token = getItem(AUTH_TOKEN_KEY);
          if (token) {
            router.replace("/(root)/home");
            Toast.show({
              type: "success",
              text1: "Registration Completed",
              text2: "Your organization registered successfully",
            });
          } else {
            Toast.show({
              type: "success",
              text1: "Check your email",
              text2: "Your login crendentials has sent to your email",
            });
            router.replace("/(auth)/login");
          }

          setIsLoading(false);
        })
        .catch((e) => {
          console.error("e ->", e);
          let errors = e.response?.data?.errors;
          if (errors) {
            console.error("errors -> ", errors);
            setErrors(errors);
          }
          setIsLoading(false);
          Toast.show({
            type: "error",
            text1: "Invalid inputs",
            text2: "Enter a valid details to register your organization",
          });
        });
    }
  };

  const setFieldValidationStatusFunc = (
    fieldName: string,
    isValid: boolean,
  ) => {
    if (fieldValidationStatus[fieldName]) {
      fieldValidationStatus[fieldName](isValid);
    }
  };

  return (
    <View>
      {isLoading ? (
        <LoadingBar />
      ) : (
        <ScrollView automaticallyAdjustKeyboardInsets={true}>
          <Box className="px-4  mb-12">
            <VStack>
              {/* <Text className="text-2xl font-bold">
                Register Your Organization 🚀
              </Text>
              <Text className="color-gray-500 text-sm mt-1">
                Please provide the details below to register your organization.
                As the POC (Point of Contact), you’ll be able to manage your
                organization’s account, add users, and oversee the tickets
                raised by your employees.
              </Text> */}
              <VStack className="gap-4 mt-3">
                <ImageFormField
                  fieldName="orgImage"
                  label="Organization Image"
                  canValidateField={canValidateField}
                  setCanValidateField={setCanValidateField}
                  setFieldValidationStatus={setFieldValidationStatus}
                  validateFieldFunc={setFieldValidationStatusFunc}
                  errors={errors}
                  setErrors={setErrors}
                  imagePath={orgImage}
                  setImagePath={setOrgImage}
                />
                <PrimaryTextFormField
                  fieldName="orgName"
                  label="Organization Name"
                  placeholder="Enter here"
                  errors={errors}
                  setErrors={setErrors}
                  min={3}
                  defaultValue={customerLeadDetailsModel.orgName}
                  filterExp={/^[a-zA-Z0-9 ]*$/}
                  onChangeText={(value) => {
                    console.log("value", value);
                    setCustomerLeadDetailsModel((prevState) => {
                      prevState.orgName = value;
                      return prevState;
                    });
                  }}
                  canValidateField={canValidateField}
                  setCanValidateField={setCanValidateField}
                  setFieldValidationStatus={setFieldValidationStatus}
                  validateFieldFunc={setFieldValidationStatusFunc}
                />
                <PrimaryTextFormField
                  fieldName="orgMobile"
                  label="Organization Mobile No."
                  placeholder="Enter here"
                  defaultValue={customerLeadDetailsModel.orgMobile}
                  errors={errors}
                  setErrors={setErrors}
                  min={10}
                  max={10}
                  keyboardType="phone-pad"
                  filterExp={/^[0-9]*$/}
                  canValidateField={canValidateField}
                  setCanValidateField={setCanValidateField}
                  setFieldValidationStatus={setFieldValidationStatus}
                  validateFieldFunc={setFieldValidationStatusFunc}
                  customValidations={(value) => {
                    // mobile no should start with 6-9
                    const customRE = /^[6-9]/;
                    if (!customRE.test(value)) {
                      return "Mobile no. should start with 6-9";
                    }
                    return undefined;
                  }}
                  onChangeText={(value) => {
                    console.log("value", value);
                    setCustomerLeadDetailsModel((prevState) => {
                      prevState.orgMobile = value;
                      return prevState;
                    });
                  }}
                />
                <ConfigurationDropdownFormField
                  configurationCategory={TYPE_OF_ORG}
                  placeholder="Select type"
                  label="Type of organization"
                  errors={errors}
                  setErrors={setErrors}
                  fieldName="typeOfOrgId"
                  canValidateField={canValidateField}
                  setCanValidateField={setCanValidateField}
                  setFieldValidationStatus={setFieldValidationStatus}
                  validateFieldFunc={setFieldValidationStatusFunc}
                  onItemSelect={(config) => {
                    setCustomerLeadDetailsModel((prevState) => {
                      prevState.typeOfOrg = config.id;
                      return prevState;
                    });
                  }}
                />
                <ConfigurationDropdownFormField
                  configurationCategory={CATEGORY_OF_ORG}
                  placeholder="Select category"
                  label="Category of organization"
                  errors={errors}
                  setErrors={setErrors}
                  fieldName="categoryOfOrgId"
                  canValidateField={canValidateField}
                  setCanValidateField={setCanValidateField}
                  setFieldValidationStatus={setFieldValidationStatus}
                  validateFieldFunc={setFieldValidationStatusFunc}
                  onItemSelect={(config) => {
                    setCustomerLeadDetailsModel((prevState) => {
                      prevState.categoryOfOrg = config.id;
                      return prevState;
                    });
                  }}
                />
                <ConfigurationDropdownFormField
                  configurationCategory={SIZE_OF_ORG}
                  placeholder="Select size"
                  label="Size of organization"
                  errors={errors}
                  setErrors={setErrors}
                  fieldName="sizeOfOrgId"
                  canValidateField={canValidateField}
                  setCanValidateField={setCanValidateField}
                  setFieldValidationStatus={setFieldValidationStatus}
                  validateFieldFunc={setFieldValidationStatusFunc}
                  onItemSelect={(config) => {
                    setCustomerLeadDetailsModel((prevState) => {
                      prevState.sizeOfOrg = config.id;
                      return prevState;
                    });
                  }}
                />
                <PrimaryTextFormField
                  fieldName="gstin"
                  label="GSTIN No."
                  placeholder="22AAAAA0000A1Z5"
                  defaultValue={customerLeadDetailsModel.gstin}
                  errors={errors}
                  setErrors={setErrors}
                  min={15}
                  max={15}
                  filterExp={/^[a-zA-Z0-9]*$/}
                  customValidations={(value) => {
                    const customRE =
                      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
                    if (!customRE.test(value)) {
                      return "Please enter a valid GST NO";
                    }
                    return undefined;
                  }}
                  isRequired={false}
                  textCase={TextCase.uppercase}
                  onChangeText={(value) => {
                    console.log("value", value);
                    setCustomerLeadDetailsModel((prevState) => {
                      prevState.gstin = value;
                      return prevState;
                    });
                  }}
                  canValidateField={canValidateField}
                  setCanValidateField={setCanValidateField}
                  setFieldValidationStatus={setFieldValidationStatus}
                  validateFieldFunc={setFieldValidationStatusFunc}
                />
                <FormControl
                  isInvalid={isFormFieldInValid("msmeNo", errors).length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>MSME No.</FormControlLabelText>
                  </FormControlLabel>
                  <Input variant="outline" size="md">
                    <InputField
                      placeholder="ASDF1234QWER"
                      defaultValue={customerLeadDetailsModel?.msmeNo ?? ""}
                      onChangeText={(e) => {
                        if (customerLeadDetailsModel) {
                          customerLeadDetailsModel.msmeNo = e;
                        }
                      }}
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("msmeNo", errors)}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <PrimaryTextFormField
                  fieldName="firstName"
                  label="POC First Name"
                  placeholder="Enter here"
                  errors={errors}
                  setErrors={setErrors}
                  min={4}
                  defaultValue={customerLeadDetailsModel.firstName}
                  filterExp={/^[a-zA-Z ]*$/}
                  canValidateField={canValidateField}
                  setCanValidateField={setCanValidateField}
                  setFieldValidationStatus={setFieldValidationStatus}
                  validateFieldFunc={setFieldValidationStatusFunc}
                  onChangeText={(value) => {
                    setCustomerLeadDetailsModel((prevState) => {
                      prevState.firstName = value;
                      return prevState;
                    });
                  }}
                />
                <PrimaryTextFormField
                  fieldName="lastName"
                  label="POC Last Name"
                  placeholder="Enter here"
                  errors={errors}
                  setErrors={setErrors}
                  defaultValue={customerLeadDetailsModel.lastName}
                  filterExp={/^[a-zA-Z ]*$/}
                  canValidateField={canValidateField}
                  setCanValidateField={setCanValidateField}
                  setFieldValidationStatus={setFieldValidationStatus}
                  validateFieldFunc={setFieldValidationStatusFunc}
                  onChangeText={(value) => {
                    setCustomerLeadDetailsModel((prevState) => {
                      prevState.lastName = value;
                      return prevState;
                    });
                  }}
                  isRequired={false}
                />
                <PrimaryTextFormField
                  fieldName="email"
                  label="POC Email"
                  placeholder="Enter here"
                  defaultValue={customerLeadDetailsModel.email}
                  errors={errors}
                  setErrors={setErrors}
                  min={8}
                  keyboardType="email-address"
                  filterExp={/^[A-Za-z0-9!#$%&'*+/=?^_{|}~.-@]*$/}
                  canValidateField={canValidateField}
                  setCanValidateField={setCanValidateField}
                  setFieldValidationStatus={setFieldValidationStatus}
                  validateFieldFunc={setFieldValidationStatusFunc}
                  // customValidations={(value) => {
                  //   const customRE = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
                  //   if (!customRE.test(value)) {
                  //     return "Please enter a valid email";
                  //   }
                  //   return undefined;
                  // }}
                  onChangeText={(value) => {
                    setCustomerLeadDetailsModel((prevState) => {
                      prevState.email = value;
                      return prevState;
                    });
                  }}
                />
                <PrimaryTextFormField
                  fieldName="mobile"
                  label="POC Mobile No."
                  placeholder="Enter here"
                  defaultValue={customerLeadDetailsModel.mobile}
                  errors={errors}
                  setErrors={setErrors}
                  min={10}
                  max={10}
                  keyboardType="phone-pad"
                  filterExp={/^[0-9]*$/}
                  canValidateField={canValidateField}
                  setCanValidateField={setCanValidateField}
                  setFieldValidationStatus={setFieldValidationStatus}
                  validateFieldFunc={setFieldValidationStatusFunc}
                  customValidations={(value) => {
                    // mobile no should start with 6-9
                    const customRE = /^[6-9]/;
                    if (!customRE.test(value)) {
                      return "Mobile no. should start with 6-9";
                    }
                    return undefined;
                  }}
                  onChangeText={(value) => {
                    setCustomerLeadDetailsModel((prevState) => {
                      prevState.mobile = value;
                      return prevState;
                    });
                  }}
                />
                <PrimaryTextFormField
                  fieldName="alternateMobile"
                  label="POC Alternate Mobile No."
                  placeholder="Enter here"
                  defaultValue={customerLeadDetailsModel.alternateMobile}
                  errors={errors}
                  setErrors={setErrors}
                  min={10}
                  max={10}
                  keyboardType="phone-pad"
                  filterExp={/^[0-9]*$/}
                  canValidateField={canValidateField}
                  setCanValidateField={setCanValidateField}
                  setFieldValidationStatus={setFieldValidationStatus}
                  validateFieldFunc={setFieldValidationStatusFunc}
                  customValidations={(value) => {
                    // mobile no should start with 6-9
                    const customRE = /^[6-9]/;
                    if (!customRE.test(value)) {
                      return "Mobile no. should start with 6-9";
                    }
                    return undefined;
                  }}
                  onChangeText={(value) => {
                    setCustomerLeadDetailsModel((prevState) => {
                      prevState.alternateMobile = value;
                      return prevState;
                    });
                  }}
                />
                <PrimaryTextareaFormField
                  fieldName="description"
                  label="Description"
                  placeholder="Write a short description about your organization"
                  errors={errors}
                  setErrors={setErrors}
                  min={10}
                  max={200}
                  defaultValue={customerLeadDetailsModel.description}
                  filterExp={/^[a-zA-Z0-9 ]*$/}
                  onChangeText={(value) => {
                    setCustomerLeadDetailsModel((prevState) => {
                      prevState.description = value;
                      return prevState;
                    });
                  }}
                  canValidateField={canValidateField}
                  setCanValidateField={setCanValidateField}
                  setFieldValidationStatus={setFieldValidationStatus}
                  validateFieldFunc={setFieldValidationStatusFunc}
                />
              </VStack>
              <Text className="font-bold text-lg mt-8">
                Organization Address
              </Text>
              <VStack className="gap-4 mt-3">
                <PrimaryTextFormField
                  fieldName="address"
                  label="Address"
                  placeholder="Enter here"
                  errors={errors}
                  setErrors={setErrors}
                  min={4}
                  defaultValue={customerLeadDetailsModel.address}
                  filterExp={/^[a-zA-Z0-9 \/#.]*$/}
                  canValidateField={canValidateField}
                  setCanValidateField={setCanValidateField}
                  setFieldValidationStatus={setFieldValidationStatus}
                  validateFieldFunc={setFieldValidationStatusFunc}
                  onChangeText={(value) => {
                    setCustomerLeadDetailsModel((prevState) => {
                      prevState.address = value;
                      return prevState;
                    });
                  }}
                />
                <PrimaryTypeheadFormField
                  type={GeoLocationType.PINCODE}
                  onClearPress={onClearPress}
                  selectedValue={selectedPincode}
                  suggestions={pincodes}
                  getSuggestions={getSuggestions}
                  setSelectedValue={setSelectedPincode}
                  placeholder="Search pincode"
                  fieldName="pincodeId"
                  label="Pincode"
                  supportText="Please enter the first three digits of your postal code to
                    view nearby locations."
                  errors={errors}
                  setErrors={setErrors}
                  onItemSelect={onItemSelect}
                  keyboardType="numeric"
                  canValidateField={canValidateField}
                  setCanValidateField={setCanValidateField}
                  setFieldValidationStatus={setFieldValidationStatus}
                  validateFieldFunc={setFieldValidationStatusFunc}
                  // defaultValue={{
                  //   id: "asdf",
                  //   title: "560078",
                  // }}
                />
                <PrimaryTypeheadFormField
                  type={GeoLocationType.AREA}
                  onClearPress={onClearPress}
                  selectedValue={selectedArea}
                  suggestions={areas}
                  getSuggestions={getSuggestions}
                  setSelectedValue={setSelectedArea}
                  placeholder="Search area"
                  fieldName="areaId"
                  label="Area"
                  errors={errors}
                  setErrors={setErrors}
                  editable={selectedPincode?.id !== undefined}
                  canValidateField={canValidateField}
                  setCanValidateField={setCanValidateField}
                  setFieldValidationStatus={setFieldValidationStatus}
                  validateFieldFunc={setFieldValidationStatusFunc}
                />
                <PrimaryTypeheadFormField
                  type={GeoLocationType.CITY}
                  onClearPress={onClearPress}
                  selectedValue={selectedCity}
                  suggestions={cities}
                  getSuggestions={getSuggestions}
                  setSelectedValue={setSelectedCity}
                  placeholder="Search city"
                  fieldName="cityId"
                  label="City"
                  errors={errors}
                  setErrors={setErrors}
                  editable={false}
                  canValidateField={canValidateField}
                  setCanValidateField={setCanValidateField}
                  setFieldValidationStatus={setFieldValidationStatus}
                  validateFieldFunc={setFieldValidationStatusFunc}
                />
                <PrimaryTypeheadFormField
                  type={GeoLocationType.STATE}
                  onClearPress={onClearPress}
                  selectedValue={selectedState}
                  suggestions={states}
                  getSuggestions={getSuggestions}
                  setSelectedValue={setSelectedState}
                  placeholder="Search state"
                  fieldName="stateId"
                  label="State"
                  errors={errors}
                  setErrors={setErrors}
                  editable={false}
                  canValidateField={canValidateField}
                  setCanValidateField={setCanValidateField}
                  setFieldValidationStatus={setFieldValidationStatus}
                  validateFieldFunc={setFieldValidationStatusFunc}
                />
                <PrimaryTypeheadFormField
                  type={GeoLocationType.COUNTRY}
                  onClearPress={onClearPress}
                  selectedValue={selectedCountry}
                  suggestions={countries}
                  getSuggestions={getSuggestions}
                  setSelectedValue={setSelectedCountry}
                  placeholder="Search country"
                  fieldName="countryId"
                  label="Country"
                  errors={errors}
                  setErrors={setErrors}
                  editable={false}
                  canValidateField={canValidateField}
                  setCanValidateField={setCanValidateField}
                  setFieldValidationStatus={setFieldValidationStatus}
                  validateFieldFunc={setFieldValidationStatusFunc}
                />
              </VStack>
              <SubmitButton
                isLoading={isLoading}
                onPress={updateCustomerLeadDetails}
                btnText="Save"
              />
            </VStack>
          </Box>
        </ScrollView>
      )}
    </View>
  );
};

export default RegistrationScreen;
