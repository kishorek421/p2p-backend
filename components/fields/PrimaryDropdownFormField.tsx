import { useEffect } from "react";
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
import PrimaryDropdownField from "./PrimaryDropdownField";

interface PrimaryDropdownFormFieldProps {
  options: any[];
  selectedValue: any;
  setSelectedValue: any;
  type: any;
  onItemSelect?: (type: string, selectedItem: any) => void;
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
}

const PrimaryDropdownFormField = ({
  options,
  selectedValue,
  setSelectedValue,
  type,
  onItemSelect,
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
}: PrimaryDropdownFormFieldProps) => {
  // useEffect(() => {}, [selectedValue]);

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

  const validateField = (newValue: any) => {
    if (isRequired && newValue.value === undefined) {
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
      <PrimaryDropdownField
        options={options}
        selectedValue={selectedValue}
        placeholder={placeholder}
        onItemSelect={onItemSelect}
        type={type}
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

export default PrimaryDropdownFormField;
