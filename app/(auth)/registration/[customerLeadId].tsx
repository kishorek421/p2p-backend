import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
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
import React, { useEffect, useRef, useState } from "react";
import { ConfigurationModel } from "@/models/configurations";
import api from "@/services/api";
import {
  CREATE_CUSTOMER,
  GET_AREAS,
  GET_CITIES,
  GET_CONFIGURATIONS_BY_CATEGORY,
  GET_COUNTRIES,
  GET_CUSTOMER_LEAD_DETAILS,
  GET_PINCODES,
  GET_STATES,
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
import { ApiResponseModel, DropdownModel, ErrorModel } from "@/models/common";
import { CustomerLeadDetailsModel } from "@/models/customers";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, ButtonText } from "@/components/ui/button";
import ImagePickerComponent from "@/components/ImagePickerComponent";
import { Image } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import { getFileName } from "@/utils/helper";
import Toast from "react-native-toast-message";
import LoadingBar from "@/components/LoadingBar";

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
  const [pincodes, setPincodes] = useState<PincodeListItemModel[]>([]);
  const [areas, setAreas] = useState<AreaListItemModel[]>([]);
  const [cities, setCities] = useState<CityListItemModel[]>([]);
  const [states, setStates] = useState<StateListItemModel[]>([]);
  const [countries, setCountries] = useState<CountryListItemModel[]>([]);

  // selected options
  // configurations
  const [selectedTypeOfOrg, setSelectedTypeOfOrg] =
    useState<ConfigurationModel>({});
  const [selectedCategoryOfOrg, setSelectedCategoryOfOrg] =
    useState<ConfigurationModel>({});
  const [selectedSizeOfOrg, setSelectedSizeOfOrg] =
    useState<ConfigurationModel>({});
  // geolocations
  const [selectedPincode, setSelectedPincode] = useState<DropdownModel>();
  const [selectedArea, setSelectedArea] = useState<DropdownModel>();
  const [selectedCity, setSelectedCity] = useState<DropdownModel>();
  const [selectedState, setSelectedState] = useState<DropdownModel>();
  const [selectedCountry, setSelectedCountry] = useState<DropdownModel>();

  const [customerLeadDetailsModel, setCustomerLeadDetailsModel] =
    useState<CustomerLeadDetailsModel>({});

  const router = useRouter();

  const [isLead, setIsLead] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [errors, setErrors] = useState<ErrorModel[]>([]);

  const bottomSheetRef = useRef(null);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [assetImage, setAssetImage] = useState("");

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
    // geolocations
    const loadPincodes = () => {
      api
        .get(GET_PINCODES)
        .then((response) => {
          setPincodes(response.data?.data ?? []);
        })
        .catch((e) => {
          console.error(e);
        });
    };
    const loadAreas = () => {
      api
        .get(GET_AREAS)
        .then((response) => {
          setAreas(response.data?.data ?? []);
        })
        .catch((e) => {
          console.error(e);
        });
    };
    const loadCities = () => {
      api
        .get(GET_CITIES)
        .then((response) => {
          setCities(response.data?.data ?? []);
        })
        .catch((e) => {
          console.error(e);
        });
    };
    const loadStates = () => {
      api
        .get(GET_STATES)
        .then((response) => {
          setStates(response.data?.data ?? []);
        })
        .catch((e) => {
          console.error(e);
        });
    };
    const loadCountries = () => {
      api
        .get(GET_COUNTRIES)
        .then((response) => {
          setCountries(response.data?.data ?? []);
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
              label: data.pincodeDetails?.pincode,
              value: data.pincodeDetails?.id,
            });
            setSelectedArea({
              label: data.areaDetails?.areaName,
              value: data.areaDetails?.id,
            });
            setSelectedCity({
              label: data.cityDetails?.cityName,
              value: data.cityDetails?.id,
            });
            setSelectedState({
              label: data.stateDetails?.stateName,
              value: data.stateDetails?.id,
            });
            setSelectedCountry({
              label: data.countryDetails?.countryName,
              value: data.countryDetails?.id,
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
    // geolocations
    loadPincodes();
    loadAreas();
    loadCities();
    loadStates();
    loadCountries();
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
    customerLeadDetailsModel.pincodeId = selectedPincode?.value;
    customerLeadDetailsModel.areaId = selectedArea?.value;
    customerLeadDetailsModel.cityId = selectedCity?.value;
    customerLeadDetailsModel.stateId = selectedState?.value;
    customerLeadDetailsModel.countryId = selectedCountry?.value;
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

    formData.append(
      "orgImageFile",
      new File([assetImage], getFileName(assetImage, true), {
        type: "image/jpg",
      }),
    );

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
        console.error(e.response?.data);
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

  const setSelectedGeolocations = (type: string, e: any) => {
    console.log("e", e);
    switch (type) {
      case "pincode":
        let selectedPincode = pincodes.find((pincode) => pincode.id === e);
        setSelectedPincode({
          label: selectedPincode?.pincode?.toString(),
          value: selectedPincode?.id,
        });
        break;
      case "area":
        let selectedArea = areas.find((area) => area.id === e);
        setSelectedArea({
          label: selectedArea?.areaName,
          value: selectedArea?.id,
        });
        break;
      case "city":
        let selectedCity = cities.find((city) => city.id === e);
        setSelectedCity({
          label: selectedCity?.cityName,
          value: selectedCity?.id,
        });
        break;
      case "state":
        let selectedState = states.find((state) => state.id === e);
        setSelectedState({
          label: selectedState?.stateName,
          value: selectedState?.id,
        });
        break;
      case "country":
        let selectedCountry = countries.find((country) => country.id === e);
        setSelectedCountry({
          label: selectedCountry?.countryName,
          value: selectedCountry?.id,
        });
        break;
    }
  };

  return (
    <SafeAreaView>
      {isLoading ? (
        <LoadingBar />
      ) : (
        <ScrollView>
          <Box className="p-4">
            <VStack>
              <Text className="text-2xl font-bold">
                Launch your experience 🚀
              </Text>
              <Text className="color-gray-400 text-sm mt-1">
                Let's explore more about you
              </Text>
              <Text className="font-bold text-lg mt-8">Profile Details</Text>
              <VStack className="gap-4 mt-3">
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
              </VStack>
              <Text className="font-bold text-lg mt-8">
                Organization Details
              </Text>
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
                    <FormControlLabelText>Address Line 1</FormControlLabelText>
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
                  <CustomSelect
                    options={pincodes.map((pincode) => ({
                      label: pincode.pincode?.toString(),
                      value: pincode.id,
                    }))}
                    placeholder="Select pincode"
                    selectedValue={selectedPincode}
                    type="pincode"
                    onChange={setSelectedGeolocations}
                  />
                  <FormControlError>
                    <FormControlErrorText>
                      {isFormFieldInValid("pincodeId")}
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <FormControl
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
                </FormControl>
                <FormControl
                  isInvalid={isFormFieldInValid("cityId").length > 0}
                >
                  <FormControlLabel className="mb-1">
                    <FormControlLabelText>City</FormControlLabelText>
                  </FormControlLabel>
                  <CustomSelect
                    options={cities.map((city) => ({
                      label: city.cityName?.toString(),
                      value: city.id,
                    }))}
                    placeholder="Select city"
                    selectedValue={selectedCity}
                    type="city"
                    onChange={setSelectedGeolocations}
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
                  <CustomSelect
                    options={states.map((state) => ({
                      label: state.stateName?.toString(),
                      value: state.id,
                    }))}
                    placeholder="Select state"
                    selectedValue={selectedState}
                    type="state"
                    onChange={setSelectedGeolocations}
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
                  <CustomSelect
                    options={countries.map((country) => ({
                      label: country.countryName?.toString(),
                      value: country.id,
                    }))}
                    placeholder="Select country"
                    selectedValue={selectedCountry}
                    type="country"
                    onChange={setSelectedGeolocations}
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
                className="bg-primary-950 mt-8 "
                onPress={updateCustomerLeadDetails}
              >
                <ButtonText>Save</ButtonText>
              </Button>
            </VStack>
          </Box>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default RegistrationScreen;
