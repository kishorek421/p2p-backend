import { useEffect, useState } from "react";
import { isFormFieldInValid, setErrorValue } from "@/utils/helper";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlLabelAstrick,
  FormControlError,
  FormControlErrorText,
} from "../ui/form-control";
import { ErrorModel } from "@/models/common";
import PrimaryDatetimePickerField from "./PrimaryDateTimePickerField";

interface PrimaryDatetimePickerFormFieldProps {
  onSelect?: (value: string) => void;
  placeholder: string;
  canValidateField: boolean;
  setCanValidateField: any;
  setFieldValidationStatus: any;
  validateFieldFunc: (fieldName: string, isValid: boolean) => void;
  fieldName: string;
  errors: ErrorModel[];
  setErrors: any;
  label: string;
  isRequired?: boolean;
  defaultValue?: any;
  className?: string;
  mode?: "date" | "datetime" | "time";
}

const PrimaryDatetimePickerFormField = ({
  placeholder,
  errors,
  setErrors,
  fieldName,
  label,
  isRequired = true,
  canValidateField,
  setCanValidateField,
  validateFieldFunc,
  setFieldValidationStatus,
  defaultValue,
  className = "",
  onSelect,
  mode,
}: PrimaryDatetimePickerFormFieldProps) => {
  // useEffect(() => {}, [selectedValue]);

  const [selectedValue, setSelectedValue] = useState<string>("");

  useEffect(() => {
    if (defaultValue) {
      setSelectedValue(defaultValue);
    }
  }, [defaultValue]);

  useEffect(() => {
    setFieldValidationStatus((prevState: any) => ({
      ...prevState,
      [fieldName]: null,
    }));
  }, []);

  useEffect(() => {
    if (canValidateField) {
      validateField(selectedValue);
      setCanValidateField(false);
    }
  }, [canValidateField]);

  const validateField = (newValue: string) => {
    if (isRequired && newValue.length === 0) {
      validateFieldFunc(fieldName, false);
      setErrorValue(
        fieldName,
        newValue ?? "",
        `Please select a ${label.toLowerCase()}`,
        setErrors,
      );
      return;
    }
    validateFieldFunc(fieldName, true);
    setErrorValue(fieldName, newValue ?? "", "", setErrors);
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
      <PrimaryDatetimePickerField
        placeholder={placeholder}
        onSelect={onSelect}
        mode={mode}
        selectedValue={selectedValue}
        setSelectedValue={setSelectedValue}
      />
      <FormControlError>
        <FormControlErrorText>
          {isFormFieldInValid(fieldName, errors)}
        </FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
};

export default PrimaryDatetimePickerFormField;
