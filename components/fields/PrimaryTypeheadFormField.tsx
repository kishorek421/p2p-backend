import { KeyboardTypeOptions, Text } from "react-native";
import React, { useEffect } from "react";
import { AutocompleteDropdownItem } from "react-native-autocomplete-dropdown";
import { isFormFieldInValid, setErrorValue } from "@/utils/helper";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  FormControlLabelAstrick,
} from "../ui/form-control";
import PrimaryTypeheadField from "./PrimaryTypeheadField";
import { ErrorModel } from "@/models/common";
import { DropdownItemModel } from "@/models/ui/dropdown_item_model";

interface PrimaryTypeheadFormFieldProps {
  type: any;
  onClearPress: (type: any) => void;
  selectedValue?: AutocompleteDropdownItem;
  suggestions: DropdownItemModel[];
  getSuggestions: (q: string, type: any, setLoading: any) => void;
  setSelectedValue: any;
  fieldName: string;
  label: string;
  placeholder: string;
  errors: ErrorModel[];
  setErrors: any;
  supportText?: string;
  isRequired?: boolean;
  filterExp?: RegExp;
  editable?: boolean;
  onItemSelect?: (type: any, item: DropdownItemModel) => void;
  keyboardType?: KeyboardTypeOptions;
  defaultValue?: DropdownItemModel;
  canValidateField: boolean;
  setCanValidateField: any;
  setFieldValidationStatus: any;
  validateFieldFunc: (fieldName: string, isValid: boolean) => void;
  backgroundColor?: string;
}

const PrimaryTypeheadFormField = ({
  type,
  onClearPress,
  selectedValue,
  suggestions,
  getSuggestions,
  setSelectedValue,
  fieldName,
  label,
  placeholder,
  errors,
  setErrors,
  supportText,
  isRequired = true,
  filterExp,
  editable = true,
  onItemSelect,
  keyboardType,
  defaultValue,
  canValidateField,
  setCanValidateField,
  validateFieldFunc,
  setFieldValidationStatus,
  backgroundColor,
}: PrimaryTypeheadFormFieldProps) => {
  useEffect(() => {
    if (defaultValue && defaultValue.id !== undefined) {
      setSelectedValue(defaultValue);
    }
  }, []);

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

  const validateField = (newValue?: AutocompleteDropdownItem) => {
    if (isRequired && (newValue === undefined || newValue.id === undefined)) {
      validateFieldFunc(fieldName, false);
      setErrorValue(
        fieldName,
        newValue?.title ?? "",
        `Please select a ${label.toLowerCase()}`,
        setErrors,
      );
      return;
    }
    validateFieldFunc(fieldName, true);
    setErrorValue(fieldName, newValue?.title ?? "", "", setErrors);
  };

  return (
    <FormControl isInvalid={isFormFieldInValid(fieldName, errors).length > 0}>
      <FormControlLabel className="mb-1">
        <FormControlLabelText>{label}</FormControlLabelText>
        <FormControlLabelAstrick className="text-red-400 ms-0.5">
          {isRequired ? "*" : ""}
        </FormControlLabelAstrick>
      </FormControlLabel>
      <PrimaryTypeheadField
        type={type}
        onClearPress={onClearPress}
        selectedValue={selectedValue}
        suggestions={suggestions}
        getSuggestions={getSuggestions}
        setSelectedValue={setSelectedValue}
        placeholder={placeholder}
        filterExp={filterExp}
        editable={editable}
        onItemSelect={onItemSelect}
        keyboardType={keyboardType}
        fieldName={fieldName}
        errors={errors}
        backgroundColor={backgroundColor}
      />
      <FormControlError>
        <FormControlErrorText>
          {isFormFieldInValid(fieldName, errors)}
        </FormControlErrorText>
      </FormControlError>
      {supportText && (
        <Text className="mt-1 text-gray-500 text-sm">{supportText}</Text>
      )}
    </FormControl>
  );
};

export default PrimaryTypeheadFormField;
