import { SafeAreaView } from "react-native-safe-area-context";
import { Linking, Text, View } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  GET_CUSTOMER_LEAD_DETAILS,
  GET_USER_DETAILS,
  LOGIN,
} from "@/constants/api_endpoints";
import api from "@/services/api";
import { ApiResponseModel, ErrorModel } from "@/models/common";
import SubmitButton from "@/components/SubmitButton";
import {
  AUTH_TOKEN_KEY,
  CUSTOMER_LEAD_ID,
  IS_LEAD,
  REFRESH_TOKEN_KEY,
} from "@/constants/storage_keys";
import { getItem, setItem } from "@/utils/secure_store";
import { CUSTOMER_LEAD_ACTIVE } from "@/constants/configuration_keys";
import { CustomerLeadDetailsModel } from "@/models/customers";
import Toast from "react-native-toast-message";
import PrimaryTextFormField from "@/components/fields/PrimaryTextFormField";
import { UserDetailsModel } from "@/models/users";

const LoginScreen = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [errors, setErrors] = useState<ErrorModel[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // can validate fields
  const [canValidateField, setCanValidateField] = useState(false);

  const [fieldValidationStatus, setFieldValidationStatus] = useState<any>({});

  const login = async () => {
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

      let data = {
        email: email,
        password: password,
      };

      setErrors([]);

      api
        .post(LOGIN, data)
        .then(async (response) => {
          let loginData = response.data.data;
          console.log("loginData ", loginData);

          await setItem(AUTH_TOKEN_KEY, loginData.token);
          await setItem(REFRESH_TOKEN_KEY, loginData.refreshToken);
          await setItem(IS_LEAD, "false");

          if (loginData) {
            try {
              let leadResponse =
                await api.get<ApiResponseModel<UserDetailsModel>>(
                  GET_USER_DETAILS,
                );
              let data = leadResponse.data.data ?? {};
              console.log("customerData", data);

              if (data && data.id) {
                let leadStatus = data.statusDetails?.key;
                console.log("=+++_+_+_)+_+_+_+_", leadStatus);

                await setItem(CUSTOMER_LEAD_ID, data.id);

                if (leadStatus === CUSTOMER_LEAD_ACTIVE) {
                  await setItem(IS_LEAD, "false");
                  router.replace({ pathname: "/home" });
                } else {
                  let userType = data.userTypeDetails?.key;
                  if (userType === "CUSTOMER") {
                    await setItem(IS_LEAD, "true");
                    router.replace({
                      pathname: "/(auth)/registration/[customerLeadId]",
                      params: { customerLeadId: data.id },
                    });
                  } else {
                    Toast.show({
                      type: "error",
                      text1: "Account activation",
                      text2:
                        "Your account is not activated to login, please contact your admin",
                    });
                  }
                }
                setIsLoading(false);
              } else {
                const customerLeadResponse = await api.get<
                  ApiResponseModel<CustomerLeadDetailsModel>
                >(GET_CUSTOMER_LEAD_DETAILS);
                const customerData = customerLeadResponse.data?.data;
                if (customerData) {
                  const customerLeadStatus =
                    customerData.onBoardingStatusDetails?.key;
                  await setItem(CUSTOMER_LEAD_ID, customerData.id ?? "");
                  if (customerLeadStatus === CUSTOMER_LEAD_ACTIVE) {
                    await setItem(IS_LEAD, "false");
                    router.replace({ pathname: "/home" });
                  } else {
                    await setItem(IS_LEAD, "true");
                    Toast.show({
                      type: "error",
                      text1: "Complete Registration",
                    });
                    router.replace({
                      pathname: "/(auth)/registration/[customerLeadId]",
                      params: { customerLeadId: customerData.id ?? "" },
                    });
                  }
                } else {
                  Toast.show({
                    type: "error",
                    text1: "Invalid credentials",
                    text2: "Enter a valid email and password",
                  });
                }
                setIsLoading(false);
              }
            } catch (e) {
              console.error();
              const customerLeadResponse = await api.get<
                ApiResponseModel<CustomerLeadDetailsModel>
              >(GET_CUSTOMER_LEAD_DETAILS);
              const customerData = customerLeadResponse.data?.data;
              if (customerData) {
                const customerLeadStatus =
                  customerData.onBoardingStatusDetails?.key;
                await setItem(CUSTOMER_LEAD_ID, customerData.id ?? "");
                if (customerLeadStatus === CUSTOMER_LEAD_ACTIVE) {
                  await setItem(IS_LEAD, "false");
                  router.replace({ pathname: "/home" });
                } else {
                  await setItem(IS_LEAD, "true");
                  Toast.show({
                    type: "error",
                    text1: "Complete Registration",
                  });
                  router.replace({
                    pathname: "/(auth)/registration/[customerLeadId]",
                    params: { customerLeadId: customerData.id ?? "" },
                  });
                }
              } else {
                Toast.show({
                  type: "error",
                  text1: "Invalid credentials",
                  text2: "Enter a valid email and password",
                });
              }
              setIsLoading(false);
            }
          } else {
            setIsLoading(false);
          }
        })
        .catch((e) => {
          console.error(e);
          // console.error(e.response?.data);
          let errors = e.response?.data?.errors;
          if (errors) {
            console.error("errors -> ", errors);
            setErrors(errors);
          }
          setIsLoading(false);
          Toast.show({
            type: "error",
            text1: "Invalid credentials",
            text2: "Enter a valid email and password",
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
    <SafeAreaView>
      <View className="h-full flex justify-between pb-14">
        <VStack className="mt-2 p-4 h-full">
          <Text className="text-2xl font-bold text-primary-950">
            Welcome 👋
          </Text>
          <Text className="color-gray-400 text-md mt-1 pe-4 leading-6">
            Log in to manage your organization's IT issues seamlessly
          </Text>
          <VStack className="gap-4 mt-4">
            <PrimaryTextFormField
              fieldName="email"
              label="Email"
              placeholder="customer@business.com"
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
              //   const customRE = /^[\w\.-]+@[a-zA-Z\d-]+(\.[a-zA-Z\d-]+)*\.[a-zA-Z]{2}$/;
              //   if (!customRE.test(value)) {
              //     return "Please enter a valid email";
              //   }
              //   return undefined;
              // }}
              onChangeText={(value) => {
                setEmail(value);
              }}
            />
            <PrimaryTextFormField
              inputType="password"
              fieldName="password"
              label="Password"
              placeholder="•••••••••"
              errors={errors}
              setErrors={setErrors}
              min={8}
              keyboardType="visible-password"
              // filterExp={/^[A-Za-z0-9!#$%&'*+/=?^_{|}~.-@]*$/}
              canValidateField={canValidateField}
              setCanValidateField={setCanValidateField}
              setFieldValidationStatus={setFieldValidationStatus}
              validateFieldFunc={setFieldValidationStatusFunc}
              onChangeText={(value) => {
                setPassword(value);
              }}
            />
            <SubmitButton
              btnText="Log In"
              isLoading={isLoading}
              onPress={login}
            />
            <Text className="mt-2 text-center text-sm">
              Don't have a account?{" "}
              <Link
                href="/registration/null"
                className="color-secondary-950 font-bold underline"
              >
                Register Now
              </Link>
            </Text>
          </VStack>
        </VStack>
        <Text className=" text-sm text-center px-12 ">
          By logging in, you agree to our{" "}
          <Text
            onPress={() => {
              Linking.openURL("https://godesk.co.in/Privacy_Policy.html");
            }}
            className="text-primary-950 font-bold"
          >
            Terms & Conditions
          </Text>{" "}
          and{" "}
          <Text
            onPress={() => {
              Linking.openURL("https://godesk.co.in/Privacy_Policy.html");
            }}
            className="font-bold text-primary-950"
          >
            Privacy Policy
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
