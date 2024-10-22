import {
  Dimensions,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
import { ConfigurationModel } from "@/models/configurations";
import api from "@/services/api";
import {
  CREATE_CUSTOMER,
  GET_AREAS_LIST_BY_NAME_SEARCH,
  GET_CITIES_LIST_BY_NAME_SEARCH,
  GET_CONFIGURATIONS_BY_CATEGORY,
  GET_COUNTRIES_LIST_BY_NAME_SEARCH,
  GET_CUSTOMER_LEAD_DETAILS,
  GET_PINCODES_LIST_BY_PINCODE_SEARCH,
  GET_STATES_LIST_BY_NAME_SEARCH,
} from "@/constants/api_endpoints";
import {
  CATEGORY_OF_ORG,
  CUSTOMER_LEAD_ACTIVE,
  SIZE_OF_ORG,
  TYPE_OF_ORG,
} from "@/constants/configuration_keys";
import ConfigurationSelect from "@/components/ConfigurationSelect";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import {
  AreaListItemModel,
  CityListItemModel,
  CountryListItemModel,
  PincodeListItemModel,
  StateListItemModel,
} from "@/models/geolocations";
import CustomSelect from "@/components/CustomSelect";
import { ApiResponseModel, ErrorModel } from "@/models/common";
import { CustomerLeadDetailsModel } from "@/models/customers";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, ButtonText } from "@/components/ui/button";
import ImagePickerComponent from "@/components/ImagePickerComponent";
import { Image } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import { getFileName } from "@/utils/helper";
import Toast from "react-native-toast-message";
import LoadingBar from "@/components/LoadingBar";
import {
  
  AutocompleteDropdown,
  AutocompleteDropdownItem,
} from "react-native-autocomplete-dropdown";
import Feather from "react-native-vector-icons/Feather";
import { GeoLocationType } from "@/enums/enums";
import CustomeTypehead from "@/components/CustomeTypehead";

const RegistrationScreen = () => {
  const { customerLeadId } = useLocalSearchParams();

  // options
  // configurations
  const [typesOfOrg, setTypesOfOrg] = useState<ConfigurationModel[]>([]);
  const [categoriesOfOrg, setCategoriesOfOrg] = useState<ConfigurationModel[]>(
    [],
  );
  const [sizesOfOrg, setSizesOfOrg] = useState<ConfigurationModel[]>([]);
  // geolocations
  const [pincodes, setPincodes] = useState<AutocompleteDropdownItem[]>([]);
  const [areas, setAreas] = useState<AutocompleteDropdownItem[]>([]);
  const [cities, setCities] = useState<AutocompleteDropdownItem[]>([]);
  const [states, setStates] = useState<AutocompleteDropdownItem[]>([]);
  const [countries, setCountries] = useState<AutocompleteDropdownItem[]>([]);

  // selected options
  // configurations
  const [selectedTypeOfOrg, setSelectedTypeOfOrg] =
    useState<ConfigurationModel>({});
  const [selectedCategoryOfOrg, setSelectedCategoryOfOrg] =
    useState<ConfigurationModel>({});
  const [selectedSizeOfOrg, setSelectedSizeOfOrg] =
    useState<ConfigurationModel>({});
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

  const [isLoading, setIsLoading] = 
  useState(true);

  const [errors, setErrors] = useState<ErrorModel[]>([]);

  const bottomSheetRef = useRef(null);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [assetImage, setAssetImage] = useState("");

  const [autoCompleteLoading, setAutoCompleteLoading] = useState(false);

  const getGeoLocationSuggestionsUrl = (type: GeoLocationType) => {
    switch (type) {
      case GeoLocationType.PINCODE:
        return GET_PINCODES_LIST_BY_PINCODE_SEARCH;
      case GeoLocationType.AREA:
        return GET_AREAS_LIST_BY_NAME_SEARCH;
      case GeoLocationType.CITY:
        return GET_CITIES_LIST_BY_NAME_SEARCH;
      case GeoLocationType.STATE:
        return GET_STATES_LIST_BY_NAME_SEARCH;
      case GeoLocationType.COUNTRY:
        return GET_COUNTRIES_LIST_BY_NAME_SEARCH;
      default:
        return "";
    }
  };

  const getSuggestions = useCallback(
    async (q: string, type: GeoLocationType) => {
      console.log("getSuggestions", q);
      if (typeof q !== "string" || q.length < 3) {
        onClearPress(type);
        return;
      }
      setAutoCompleteLoading(true);

      api
        .get(getGeoLocationSuggestionsUrl(type) + `?q=${q}`)
        .then((response) => {
          console.log("suggesgtions", response.data.data);
          setGeolocationSuggestions(type, response.data?.data ?? []);
          setAutoCompleteLoading(false);
        })
        .catch((e) => {
          console.error(e);
          setAutoCompleteLoading(false);
        });

      setAutoCompleteLoading(false);
    },
    [],
  );

  const onClearPress = useCallback((type: GeoLocationType) => {
    switch (type) {
      case GeoLocationType.PINCODE:
        setPincodes([]);
        break;
      case GeoLocationType.AREA:
        setAreas([]);
        break;
      case GeoLocationType.CITY:
        setCities([]);
        break;
      case GeoLocationType.STATE:
        setStates([]);
        break;
      case GeoLocationType.COUNTRY:
        setCountries([]);
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
      case GeoLocationType.CITY:
        setCities(
          suggestionsList.map((item: CityListItemModel) => {
            const id = item.id;
            const title = item.cityName;
            if (id && title) {
              return {
                id: id,
                title: title,
              };
            }
          }),
        );
        break;
      case GeoLocationType.STATE:
        setStates(
          suggestionsList.map((item: StateListItemModel) => {
            const id = item.id;
            const title = item.stateName;
            if (id && title) {
              return {
                id: id,
                title: title,
              };
            }
          }),
        );
        break;
      case GeoLocationType.COUNTRY:
        setCountries(
          suggestionsList.map((item: CountryListItemModel) => {
            const id = item.id;
            const title = item.countryName;
            if (id && title) {
              return {
                id: id,
                title: title,
              };
            }
          }),
        );
    }
  };

  useEffect(() => {
    const loadTypesOfOrg = () => {
      api
        .get(GET_CONFIGURATIONS_BY_CATEGORY, {
          params: {
            category: TYPE_OF_ORG,
          },
        })
        .then((response) => {
          setTypesOfOrg(response.data?.data ?? []);
        })
        .catch((e) => {
          console.error(e);
        });
    };
    const loadCategoriesOfOrg = () => {
      api
        .get(GET_CONFIGURATIONS_BY_CATEGORY, {
          params: {
            category: CATEGORY_OF_ORG,
          },
        })
        .then((response) => {
          setCategoriesOfOrg(response.data?.data ?? []);
        })
        .catch((e) => {
          console.error(e);
        });
    };
    const loadSizesOfOrg = () => {
      api
        .get(GET_CONFIGURATIONS_BY_CATEGORY, {
          params: {
            category: SIZE_OF_ORG,
          },
        })
        .then((response) => {
          setSizesOfOrg(response.data?.data ?? []);
        })
        .catch((e) => {
          console.error(e);
        });
    };

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

            setCustomerLeadDetailsModel(data);
            setIsLead(true);

            setSelectedTypeOfOrg(data.typeOfOrgDetails ?? {});
            setSelectedCategoryOfOrg(data.categoryOfOrgDetails ?? {});
            setSelectedSizeOfOrg(data.sizeOfOrgDetails ?? {});

            setSelectedPincode({
              title: (data.pincodeDetails?.pincode ?? "").toString(),
              id: data.pincodeDetails?.id ?? "",
            });
            setSelectedArea({
              title: data.areaDetails?.areaName ?? "",
              id: data.areaDetails?.id ?? "",
            });
            setSelectedCity({
              title: data.cityDetails?.cityName ?? "",
              id: data.cityDetails?.id ?? "",
            });
            setSelectedState({
              title: data.stateDetails?.stateName ?? "",
              id: data.stateDetails?.id ?? "",
            });
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

    loadTypesOfOrg();
    loadCategoriesOfOrg();
    loadSizesOfOrg();
    // load customer lead details
    loadCustomerLeadDetails();
  }, [router]);

  const toggleImagePicker = () => {
    setIsModalVisible(!isModalVisible);
    if (!isModalVisible) {
      bottomSheetRef.current?.show();
    } else {
      bottomSheetRef.current?.hide();
    }
  };

  const updateCustomerLeadDetails = () => {
    setIsLoading(true);
    customerLeadDetailsModel.typeOfOrg = selectedTypeOfOrg.id;
    customerLeadDetailsModel.categoryOfOrg = selectedCategoryOfOrg.id;
    customerLeadDetailsModel.sizeOfOrg = selectedSizeOfOrg.id;
    customerLeadDetailsModel.pincodeId = selectedPincode?.id ?? "";
    customerLeadDetailsModel.areaId = selectedArea?.id ?? "";
    customerLeadDetailsModel.cityId = selectedCity?.id ?? "";
    customerLeadDetailsModel.stateId = selectedState?.id ?? "";
    customerLeadDetailsModel.countryId = selectedCountry?.id ?? "";
    customerLeadDetailsModel.isCustomerLead = isLead;
    customerLeadDetailsModel.customerLeadId = customerLeadDetailsModel.id;

    console.log(customerLeadDetailsModel);

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

    if (assetImage) {
      // formData.append(
      //   "orgImageFile",
      //   new File([assetImage], getFileName(assetImage, true), {
      //     type: "image/jpg",
      //   }),
      // );
      // --@ts-ignore --
      formData.append("orgImageFile", {
        uri: assetImage,
        type: "image/jpg",
        name: getFileName(assetImage, true),
      } as any);
    }

    setErrors([]);

    api
      .post(CREATE_CUSTOMER, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        // router.push({pathname: ""});
        console.log(response.data.data);
        Toast.show({
          type: "success",
          text1: "Check your email",
          text2: "Crendential have been sent to your email",
        });
        setIsLoading(false);
        router.replace("/(auth)/login");
      })
      .catch((e) => {
        console.error("e ->", e);
        let errors = e.response?.data?.errors;
        if (errors) {
          console.error("errors -> ", errors);
          setErrors(errors);
        }
        setIsLoading(false);
      });
  };

  const isFormFieldInValid = (name: string): string => {
    let msg = "";
    for (const error of errors) {
      if (error.param === name) {
        msg = error.message ?? "";
      }
    }
    return msg;
  };

  return (
    <View>
      {isLoading ? (
        <LoadingBar />
      ) : (
        <ScrollView automaticallyAdjustKeyboardInsets={true}>
          <Box className="p-4">
            <VStack>
              <Text className="text-2xl font-bold">
                Register Your Organization 🚀
              </Text>
              <Text className="color-gray-500 text-sm mt-1">
                Please provide the details below to register your organization.
                As the POC (Point of Contact), you’ll be able to manage your
                organization’s account, add users, and oversee the tickets
                raised by your employees.
              </Text>
              {/* <Text className="font-bold text-lg mt-8">Profile Details</Text> */}
              {/* <VStack className="gap-4 mt-3">
                <FormControl
                  isInvalid={isFormFieldInValid("firstName").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>First Name</FormControlLabelText>
                  </FormControlLabel>
                  <Input variant="outline" size="md">
                    <InputField
                      placeholder="Enter here"
                      defaultValue={customerLeadDetailsModel?.firstName ?? ""}
                    
                      onChangeText={(e) => {
                        if (customerLeadDetailsModel) {
                          customerLeadDetailsModel.firstName = e;
                        }
                      }}
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("firstName")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl
                  isInvalid={isFormFieldInValid("lastName").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>Last Name</FormControlLabelText>
                  </FormControlLabel>
                  <Input variant="outline" size="md">
                    <InputField
                      placeholder="Enter here"
                      defaultValue={customerLeadDetailsModel?.lastName ?? ""}
                      onChangeText={(e) => {
                        if (customerLeadDetailsModel) {
                          customerLeadDetailsModel.lastName = e;
                        }
                      }}
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("lastName")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl isInvalid={isFormFieldInValid("email").length > 0}>
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>Email</FormControlLabelText>
                  </FormControlLabel>
                  <Input variant="outline" size="md">
                    <InputField
                      placeholder="customer@business.com"
                      defaultValue={customerLeadDetailsModel?.email ?? ""}
                      keyboardType="email-address"
                      onChangeText={(e) => {
                        if (customerLeadDetailsModel) {
                          customerLeadDetailsModel.email = e;
                        }
                      }}
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("email")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl
                  isInvalid={isFormFieldInValid("mobile").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>Mobile No.</FormControlLabelText>
                  </FormControlLabel>
                  <Input variant="outline" size="md">
                    <InputField
                      placeholder="Enter here"
                      defaultValue={customerLeadDetailsModel?.mobile ?? ""}
                      keyboardType="numeric"
                      onChangeText={(e) => {
                        if (customerLeadDetailsModel) {
                          customerLeadDetailsModel.mobile = e;
                        }
                      }}
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("mobile")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl
                  isRequired={true}
                  isInvalid={isFormFieldInValid("alternateMobile").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>
                      Alternate Mobile No.
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input variant="outline" size="md">
                    <InputField
                      placeholder="Enter here"
                      defaultValue={
                        customerLeadDetailsModel?.alternateMobile ?? ""
                      }
                      keyboardType="numeric"
                      onChangeText={(e) => {
                        if (customerLeadDetailsModel) {
                          customerLeadDetailsModel.alternateMobile = e;
                          
                        }
                      }}
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("alternateMobile")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              </VStack> */}
              {/* <Text className="font-bold text-lg mt-8">
                Organization Details
              </Text> */}
              <VStack className="gap-4 mt-3">
                <FormControl
                  isInvalid={isFormFieldInValid("orgImage").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>
                      Organization Image
                    </FormControlLabelText>
                  </FormControlLabel>
                  <ImagePickerComponent
                    onImagePicked={(uri: string) => {
                      setAssetImage(uri);
                    }}
                    setIsModalVisible={setIsModalVisible}
                    bottomSheetRef={bottomSheetRef}
                  />
                  {assetImage ? (
                    <View>
                      <Image
                        source={{ uri: assetImage }}
                        className="w-full h-36 rounded-xl absolute"
                      />
                      <View className="w-full flex justify-center items-center gap-4 h-36 bg-black/40 rounded-xl">
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
                        <Icon
                          name="upload"
                          className="ms-2"
                          color="white"
                          size={18}
                        />
                      </Button>
                    </View>
                  )}
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("orgImage")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl
                  isInvalid={isFormFieldInValid("orgName").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>
                      Organization Name
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input variant="outline" size="md">
                    <InputField
                      placeholder="Enter here"
                      defaultValue={customerLeadDetailsModel?.orgName ?? ""}
                      onChangeText={(e) => {
                        if (customerLeadDetailsModel) {
                          customerLeadDetailsModel.orgName = e;
                        }
                      }}
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("orgName")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl
                  isInvalid={isFormFieldInValid("orgMobile").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>
                      Organization Mobile No.
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input variant="outline" size="md">
                    <InputField
                      placeholder="Enter here"
                      defaultValue={customerLeadDetailsModel?.orgMobile ?? ""}
                      onChangeText={(e) => {
                        if (customerLeadDetailsModel) {
                          customerLeadDetailsModel.orgMobile = e;
                        }
                      }}
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("orgMobile")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl
                  isInvalid={isFormFieldInValid("typeOfOrgId").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>
                      Type of organization
                    </FormControlLabelText>
                  </FormControlLabel>
                  <ConfigurationSelect
                    options={typesOfOrg}
                    selectedConfig={selectedTypeOfOrg}
                    setSelectedConfig={setSelectedTypeOfOrg}
                    placeholder="Select type"
                  />
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("typeOfOrgId")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl
                  isInvalid={isFormFieldInValid("categoryOfOrgId").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>
                      Category of organization
                    </FormControlLabelText>
                  </FormControlLabel>
                  <ConfigurationSelect
                    options={categoriesOfOrg}
                    selectedConfig={selectedCategoryOfOrg}
                    setSelectedConfig={setSelectedCategoryOfOrg}
                    placeholder="Select category"
                  />
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("categoryOfOrgId")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl
                  isInvalid={isFormFieldInValid("sizeOfOrgId").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>
                      Size of organization
                    </FormControlLabelText>
                  </FormControlLabel>
                  <ConfigurationSelect
                    options={sizesOfOrg}
                    selectedConfig={selectedSizeOfOrg}
                    setSelectedConfig={setSelectedSizeOfOrg}
                    placeholder="Select size"
                  />
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("sizeOfOrgId")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl isInvalid={isFormFieldInValid("gstin").length > 0}>
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>GST No</FormControlLabelText>
                  </FormControlLabel>
                  <Input variant="outline" size="md">
                    <InputField
                      placeholder="ESHD123AJDUID123"
                      defaultValue={customerLeadDetailsModel?.gstin ?? ""}
                      onChangeText={(e) => {
                        if (customerLeadDetailsModel) {
                          customerLeadDetailsModel.gstin = e;
                        }
                      }}
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("gstin")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl
                  isInvalid={isFormFieldInValid("msmeNo").length > 0}
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
                      {isFormFieldInValid("msmeNo")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl
                  isInvalid={isFormFieldInValid("firstName").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>POC First Name</FormControlLabelText>
                  </FormControlLabel>
                  <Input variant="outline" size="md">
                    <InputField
                      placeholder="Enter here"
                      defaultValue={customerLeadDetailsModel?.firstName ?? ""}
                      onChangeText={(e) => {
                        if (customerLeadDetailsModel) {
                          customerLeadDetailsModel.firstName = e;
                        }
                      }}
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("firstName")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl
                  isInvalid={isFormFieldInValid("lastName").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>POC Last Name</FormControlLabelText>
                  </FormControlLabel>
                  <Input variant="outline" size="md">
                    <InputField
                      placeholder="Enter here"
                      defaultValue={customerLeadDetailsModel?.lastName ?? ""}
                      onChangeText={(e) => {
                        if (customerLeadDetailsModel) {
                          customerLeadDetailsModel.lastName = e;
                        }
                      }}
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("lastName")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl isInvalid={isFormFieldInValid("email").length > 0}>
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>POC Email</FormControlLabelText>
                  </FormControlLabel>
                  <Input variant="outline" size="md">
                    <InputField
                      placeholder="customer@business.com"
                      defaultValue={customerLeadDetailsModel?.email ?? ""}
                      onChangeText={(e) => {
                        if (customerLeadDetailsModel) {
                          customerLeadDetailsModel.email = e;
                        }
                      }}
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("email")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl
                  isInvalid={isFormFieldInValid("mobile").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>POC Mobile No.</FormControlLabelText>
                  </FormControlLabel>
                  <Input variant="outline" size="md">
                    <InputField
                      placeholder="Enter here"
                      defaultValue={customerLeadDetailsModel?.mobile ?? ""}
                      onChangeText={(e) => {
                        if (customerLeadDetailsModel) {
                          customerLeadDetailsModel.mobile = e;
                        }
                      }}
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("mobile")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl
                  isRequired={true}
                  isInvalid={isFormFieldInValid("alternateMobile").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>
                      POC Alternate Mobile No.
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input variant="outline" size="md">
                    <InputField
                      placeholder="Enter here"
                      defaultValue={
                        customerLeadDetailsModel?.alternateMobile ?? ""
                      }
                      onChangeText={(e) => {
                        if (customerLeadDetailsModel) {
                          customerLeadDetailsModel.alternateMobile = e;
                        }
                      }}
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("alternateMobile")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl
                  isInvalid={isFormFieldInValid("description").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>Description</FormControlLabelText>
                  </FormControlLabel>
                  <Textarea size="md" variant="default">
                    <TextareaInput
                      placeholder="Write a short description about your organization"
                      defaultValue={customerLeadDetailsModel?.description ?? ""}
                      onChangeText={(e) => {
                        if (customerLeadDetailsModel) {
                          customerLeadDetailsModel.description = e;
                        }
                      }}
                    />
                  </Textarea>
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("description")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              </VStack>
              <Text className="font-bold text-lg mt-8">
                Organization Address
              </Text>
              <VStack className="gap-4 mt-3">
                <FormControl
                  isInvalid={isFormFieldInValid("address").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>Address</FormControlLabelText>
                  </FormControlLabel>
                  <Input variant="outline" size="md">
                    <InputField
                      placeholder="Enter here"
                      defaultValue={customerLeadDetailsModel?.address ?? ""}
                      onChangeText={(e) => {
                        if (customerLeadDetailsModel) {
                          customerLeadDetailsModel.address = e;
                        }
                      }}
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("address")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl
                  isInvalid={isFormFieldInValid("pincodeId").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>Pincode</FormControlLabelText>
                  </FormControlLabel>
                  <CustomeTypehead
                    type={GeoLocationType.PINCODE}
                    onClearPress={onClearPress}
                    selectedValue={selectedPincode}
                    suggestions={pincodes}
                    getSuggestions={getSuggestions}
                    setSelectedValue={setSelectedPincode}
                    loading={autoCompleteLoading}
                    placeholder="Select pincode"
                  />
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("pincodeId")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                {/* <FormControl
                  isInvalid={isFormFieldInValid("areaId").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>Area</FormControlLabelText>
                  </FormControlLabel>
                  <CustomSelect
                    options={areas.map((area) => ({
                      label: area.areaName?.toString(),
                      value: area.id,
                    }))}
                    placeholder="Select area"
                    selectedValue={selectedArea}
                    type="area"
                    onChange={setSelectedGeolocations}
                  />
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("areaId")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl> */}
                <FormControl
                  isInvalid={isFormFieldInValid("areaId").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>Area</FormControlLabelText>
                  </FormControlLabel>
                  <CustomeTypehead
                    type={GeoLocationType.AREA}
                    onClearPress={onClearPress}
                    selectedValue={selectedArea}
                    suggestions={areas}
                    getSuggestions={getSuggestions}
                    setSelectedValue={setSelectedArea}
                    loading={autoCompleteLoading}
                    placeholder="Select area"
                  />
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("areaId")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl
                  isInvalid={isFormFieldInValid("cityId").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>City</FormControlLabelText>
                  </FormControlLabel>
                  <CustomeTypehead
                    type={GeoLocationType.CITY}
                    onClearPress={onClearPress}
                    selectedValue={selectedCity}
                    suggestions={cities}
                    getSuggestions={getSuggestions}
                    setSelectedValue={setSelectedCity}
                    loading={autoCompleteLoading}
                    placeholder="Select city"
                  />
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("cityId")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl
                  isInvalid={isFormFieldInValid("stateId").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>States</FormControlLabelText>
                  </FormControlLabel>
                  <CustomeTypehead
                    type={GeoLocationType.STATE}
                    onClearPress={onClearPress}
                    selectedValue={selectedState}
                    suggestions={states}
                    getSuggestions={getSuggestions}
                    setSelectedValue={setSelectedState}
                    loading={autoCompleteLoading}
                    placeholder="Select state"
                  />
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("stateId")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl
                  isInvalid={isFormFieldInValid("countryId").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>Country</FormControlLabelText>
                  </FormControlLabel>
                  <CustomeTypehead
                    type={GeoLocationType.COUNTRY}
                    onClearPress={onClearPress}
                    selectedValue={selectedCountry}
                    suggestions={countries}
                    getSuggestions={getSuggestions}
                    setSelectedValue={setSelectedCountry}
                    loading={autoCompleteLoading}
                    placeholder="Select city"
                  />
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("countryId")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
              </VStack>
              {/*<Pressable*/}
              {/*  className="bg-primary-950 mt-6 rounded p-3 items-center"*/}
              {/*  onPress={updateCustomerLeadDetails}*/}
              {/*>*/}
              {/*  <Text className="text-white font-medium">Save</Text>*/}
              {/*</Pressable>*/}
              <Button
                className="bg-primary-950 mt-8 mb-8 h-12 rounded-lg shadow-sm"
                onPress={updateCustomerLeadDetails}
              >
                <ButtonText>Save</ButtonText>
              </Button>
            </VStack>
          </Box>
        </ScrollView>
      )}
    </View>
  );
};

export default RegistrationScreen;
