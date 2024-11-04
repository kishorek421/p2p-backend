import { ConfigurationModel } from "@/models/configurations";
import ConfigurationDropdownField from "./ConfigurationDropdownField";
import { isFormFieldInValid, setErrorValue } from "@/utils/helper";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  FormControlLabelAstrick,
} from "../ui/form-control";
import { ErrorModel } from "@/models/common";
import { useEffect, useState } from "react";
import { min } from "moment";

interface ConfigurationDropdownFormFieldProps {
  configurationCategory: string;
  placeholder: string;
  errors: ErrorModel[];
  setErrors: any;
  fieldName: string;
  label: string;
  isRequired?: boolean;
  onItemSelect?: (config: ConfigurationModel) => void;
  defaultValue?: ConfigurationModel;
  canValidateField: boolean;
  setCanValidateField: any;
  setFieldValidationStatus: any;
  validateFieldFunc: (fieldName: string, isValid: boolean) => void;
  className?: string;
}

const ConfigurationDropdownFormField = ({
  configurationCategory,
  placeholder,
  errors,
  setErrors,
  fieldName,
  label,
  isRequired = true,
  onItemSelect,
  defaultValue,
  canValidateField,
  setCanValidateField,
  validateFieldFunc,
  setFieldValidationStatus,
  className = "",
}: ConfigurationDropdownFormFieldProps) => {
  const [selectedConfig, setSelectedConfig] = useState<ConfigurationModel>({});

  useEffect(() => {
    setFieldValidationStatus((prevState: any) => ({
      ...prevState,
      [fieldName]: null,
    }));
  }, []);

  useEffect(() => {
    if (defaultValue) {
      setSelectedConfig(defaultValue);
    }
  }, [defaultValue]);

  useEffect(() => {
    if (canValidateField) {
      validateField(selectedConfig);
      setCanValidateField(false);
    }
  }, [canValidateField]);

  const validateField = (newValue: ConfigurationModel) => {
    if (isRequired && newValue.id === undefined) {
      validateFieldFunc(fieldName, false);
      setErrorValue(
        fieldName,
        newValue.value ?? "",
        `Please select a ${label.toLowerCase()}`,
        setErrors,
      );
      return;
    }
    validateFieldFunc(fieldName, true);
    setErrorValue(fieldName, newValue.value ?? "", "", setErrors);
  };

  return (
    <FormControl
      isInvalid={isFormFieldInValid(fieldName, errors).length > 0}
      className={className}
    >
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
        onItemSelect={onItemSelect}
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
