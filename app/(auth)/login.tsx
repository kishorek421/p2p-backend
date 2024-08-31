import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Link } from "expo-router";

const LoginScreen = () => {
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
            <FormControl>
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
                <InputField placeholder="customer@business.com" />
              </Input>
            </FormControl>
            <FormControl>
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
                <InputField type="password" placeholder="•••••••••" />
              </Input>
            </FormControl>
            <Button
              action="secondary"
              size="lg"
              className="bg-primary-950 mt-3"
              variant="solid"
            >
              <ButtonText>Log In</ButtonText>
            </Button>
            <Text className="mt-2 text-center text-sm">
              Don't have a account?{" "}
              <Link
                href="/registration"
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
