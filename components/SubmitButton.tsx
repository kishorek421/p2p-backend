import { Button, ButtonSpinner, ButtonText } from "./ui/button";

interface SubmitButtonProps {
  isLoading: boolean;
  onPress: any;
  btnText: string;
}

const SubmitButton = ({ isLoading, onPress, btnText }: SubmitButtonProps) => {
  return (
    <Button
      className={`bg-primary-950 mt-6`}
      onPress={onPress}
      disabled={isLoading}
    >
      <ButtonText >{btnText}</ButtonText>
      {isLoading && <ButtonSpinner className="ms-2 text-white" />}
    </Button>
  );
};

export default SubmitButton;
