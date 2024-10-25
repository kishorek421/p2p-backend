import { SafeAreaView } from "react-native-safe-area-context";
import { Linking, Pressable, Text, View } from "react-native";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Link, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { GET_CUSTOMER_LEAD_DETAILS, LOGIN } from "@/constants/api_endpoints";
import api from "@/services/api";
import { ApiResponseModel, ErrorModel } from "@/models/common";
import { isFormFieldInValid } from "@/utils/helper";
import SubmitButton from "@/components/SubmitButton";
import {
  AUTH_TOKEN_KEY,
  CUSTOMER_LEAD_ID,
  IS_LEAD,
  REFRESH_TOKEN_KEY,
} from "@/constants/storage_keys";
import { setItem } from "@/utils/secure_store";
import { CUSTOMER_LEAD_ACTIVE } from "@/constants/configuration_keys";
import { CustomerLeadDetailsModel } from "@/models/customers";
import LottieView from "lottie-react-native";
import Toast from "react-native-toast-message";

const LoginScreen = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [errors, setErrors] = useState<ErrorModel[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const animationRef = useRef<LottieView>(null);

  const router = useRouter();

  const login = () => {
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

        if (loginData) {
          try {
            let leadResponse = await api.get<
              ApiResponseModel<CustomerLeadDetailsModel>
            >(GET_CUSTOMER_LEAD_DETAILS);
            let data = leadResponse.data.data ?? {};
            console.log("customerData", data);

            if (data && data.id) {
              let leadStatus = data.onBoardingStatusDetails?.key;

              await setItem(CUSTOMER_LEAD_ID, data.id);

              if (leadStatus === CUSTOMER_LEAD_ACTIVE) {
                await setItem(IS_LEAD, "false");
                router.replace({ pathname: "/home" });
              } else {
                await setItem(IS_LEAD, "true");
                router.replace({
                  pathname: "/(auth)/registration/[customerLeadId]",
                  params: { customerLeadId: data.id },
                });
              }

              setIsLoading(false);
            }
          } catch (e) {
            console.error(e);
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
            <FormControl
              isInvalid={isFormFieldInValid("email", errors).length > 0}
            >
              <FormControlLabel className="mb-1">
                <FormControlLabelText>Email</FormControlLabelText>
              </FormControlLabel>
              <Input
                variant="outline"
                size="md"
                isDisabled={false}
                isInvalid={false}
                isReadOnly={false}
              >
                <InputField
                  keyboardType="email-address"
                  placeholder="customer@business.com"
                  onChangeText={(e) => {
                    setEmail(e);
                  }}
                />
              </Input>
              <FormControlError>
                <FormControlErrorText>
                  {isFormFieldInValid("email", errors)}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
            <FormControl
              isInvalid={isFormFieldInValid("password", errors).length > 0}
            >
              <FormControlLabel className="mb-1">
                <FormControlLabelText>Password</FormControlLabelText>
              </FormControlLabel>
              <Input
                variant="outline"
                size="md"
                isDisabled={false}
                isInvalid={false}
                isReadOnly={false}
              >
                <InputField
                  type="password"
                  keyboardType="visible-password"
                  placeholder="•••••••••"
                  onChangeText={(e) => {
                    setPassword(e);
                  }}
                />
              </Input>
              <FormControlError>
                <FormControlErrorText>
                  {isFormFieldInValid("password", errors)}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
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
