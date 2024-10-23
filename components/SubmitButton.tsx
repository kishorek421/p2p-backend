import { Button, ButtonSpinner, ButtonText } from "./ui/button";

interface SubmitButtonProps {
  isLoading: boolean;
  onPress: any;
  btnText: string;
  className?: string;
}

const SubmitButton = ({ isLoading, onPress, btnText }: SubmitButtonProps) => {
  return (
    <Button
      className={`bg-primary-950 mt-6 h-12 shadow-sm rounded-lg`}
      onPress={onPress}
      disabled={isLoading}
    >
      <ButtonText className="text-white">{btnText}</ButtonText>
      {isLoading && <ButtonSpinner className="ms-2 text-white" />}
    </Button>
  );
};

export default SubmitButton;
