import { ConfigurationModel } from "@/models/configurations";
import ConfigurationDropdownField from "./ConfigurationDropdownField";
import { isFormFieldInValid } from "@/utils/helper";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  FormControlLabelAstrick,
} from "../ui/form-control";
import { ErrorModel } from "@/models/common";

interface ConfigurationDropdownFormFieldProps {
  configurationCategory: string;
  selectedConfig: ConfigurationModel;
  setSelectedConfig: any;
  placeholder: string;
  errors: ErrorModel[];
  setErrors: any;
  fieldName: string;
  label: string;
  isRequired?: boolean;
}

const ConfigurationDropdownFormField = ({
  configurationCategory,
  selectedConfig,
  setSelectedConfig,
  placeholder,
  errors,
  setErrors,
  fieldName,
  label,
  isRequired = true,
}: ConfigurationDropdownFormFieldProps) => {
  return (
    <FormControl isInvalid={isFormFieldInValid(fieldName, errors).length > 0}>
      <FormControlLabel className="mb-1">
        <FormControlLabelText>{label}</FormControlLabelText>
        <FormControlLabelAstrick className="text-red-400 ms-0.5">
          {isRequired ? "*" : ""}
        </FormControlLabelAstrick>
      </FormControlLabel>
      <ConfigurationDropdownField
        configurationCategory={configurationCategory}
        selectedConfig={selectedConfig}
        setSelectedConfig={setSelectedConfig}
        placeholder={placeholder}
      />
      <FormControlError>
        <FormControlErrorText>
          {isFormFieldInValid(fieldName, errors)}
        </FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
};

export default ConfigurationDropdownFormField;
