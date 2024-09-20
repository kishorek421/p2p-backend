import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";
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
import { useState } from "react";
import { GET_CUSTOMER_LEAD_DETAILS, LOGIN } from "@/constants/api_endpoints";
import api from "@/services/api";
import { ApiResponseModel, ErrorModel } from "@/models/common";
import { isFormFieldInValid } from "@/utils/helper";
import SubmitButton from "@/components/SubmitButton";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/storage_keys";
import { setItem } from "@/utils/secure_store";
import { CUSTOMER_LEAD_ACTIVE } from "@/constants/configuration_keys";
import { CustomerLeadDetailsModel } from "@/models/customers";

const LoginScreen = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [errors, setErrors] = useState<ErrorModel[]>([]);

  const [isLoading, setIsLoading] = useState(false);

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

              if (leadStatus === CUSTOMER_LEAD_ACTIVE) {
                router.replace({ pathname: "/home" });
              } else {
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
      });
  };

  return (
    <SafeAreaView>
      <Box className="p-4 mt-3">
        <VStack>
          <Text className="text-2xl font-bold">
            Welcome <Text className="color-primary-950">Back! 👋</Text>
          </Text>
          <Text className="color-gray-400 text-sm mt-1">
            Log in to continue where you left off
          </Text>
          <VStack className="gap-4 mt-8">
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
      </Box>
    </SafeAreaView>
  );
};

export default LoginScreen;
