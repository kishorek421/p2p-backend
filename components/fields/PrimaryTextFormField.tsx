import { View, Text, KeyboardTypeOptions } from "react-native";
import React, { useEffect, useState } from "react";
import { isFormFieldInValid } from "@/utils/helper";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  FormControlLabelAstrick,
} from "../ui/form-control";
import { Input, InputField } from "../ui/input";
import { ErrorModel } from "@/models/common";

interface PrimaryTextFormFieldProps {
  fieldName: string;
  label: string;
  placeholder: string;
  errors: ErrorModel[];
  setErrors: any;
  onChangeText: (value: string) => void;
  canValidateField: boolean;
  setCanValidateField: any;
  setFieldValidationStatus: any;
  validateFieldFunc: (fieldName: string, isValid: boolean) => void;
  defaultValue?: string;
  isRequired?: boolean;
  keyboardType?: KeyboardTypeOptions;
  min?: number;
  max?: number;
  filterExp?: RegExp;
  customValidations?: (value: string) => string | undefined;
}

const PrimaryTextFormField = ({
  fieldName,
  label,
  placeholder,
  errors,
  setErrors,
  defaultValue,
  isRequired = true,
  canValidateField,
  setCanValidateField,
  validateFieldFunc,
  setFieldValidationStatus,
  keyboardType = "default",
  onChangeText,
  min,
  max = 50,
  filterExp,
  customValidations,
}: PrimaryTextFormFieldProps) => {
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    setFieldValidationStatus((prevState: any) => ({
      ...prevState,
      [fieldName]: null,
    }));
  }, []);

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
    if (canValidateField) {
      validateField(value);
      setCanValidateField(false);
    }
  }, [defaultValue, canValidateField]);

  // error -> {value(current), message(mistake in the current value), param(in which parameter)}
  // {value, message, param} -> [errors]

  const setErrorValue = (param: string, value: string, msg: string) => {
    setErrors((prevState: ErrorModel[]) => {
      // to check whether field is present or not
      let isFieldExist = false;

      // find error and assign the message to field
      for (const e of prevState) {
        let eParam = e.param;
        if (eParam === param) {
          e.message = msg;
          e.value = value;
          isFieldExist = true;
          break;
        }
      }

      // if isFieldExist not exist
      if (!isFieldExist) {
        prevState.push({
          param: param,
          value: value,
          message: msg,
        });
      }

      return prevState;
    });
  };

  const validateField = (newValue: string) => {
    if (isRequired && newValue.length === 0) {
      validateFieldFunc(fieldName, false);
      setErrorValue(fieldName, value, `Please enter a ${label.toLowerCase()}`);
      return;
    }
    if (customValidations) {
      const errorValidationMsg = customValidations(value);
      if (errorValidationMsg) {
        validateFieldFunc(fieldName, false);
        setErrorValue(fieldName, value, errorValidationMsg);
        return;
      }
    }
    const valLen = newValue.length;
    if (min && valLen < min) {
      validateFieldFunc(fieldName, false);
      // if this field is not valid set validField is false
      setErrorValue(fieldName, value, `Min. length should be ${min}`);
      return;
    }
    validateFieldFunc(fieldName, true);
    setErrorValue(fieldName, value, "");
  };

  return (
    <FormControl
      key={fieldName}
      isInvalid={isFormFieldInValid(fieldName, errors).length > 0}
    >
      <FormControlLabel className="mb-1">
        <FormControlLabelText>{label}</FormControlLabelText>
        <FormControlLabelAstrick className="text-red-400 ms-0.5">
          {isRequired ? "*" : ""}
        </FormControlLabelAstrick>
      </FormControlLabel>
      <Input variant="outline" size="md">
        <InputField
          placeholder={placeholder}
          value={value}
          keyboardType={keyboardType}
          onChangeText={(newValue) => {
            // if expression not null and value matches the expressions(regular expressions)
            if (filterExp && !filterExp.test(newValue)) {
              return;
            }
            onChangeText(newValue);
            const valLen = newValue.length;
            if (max && valLen <= max) {
              setValue(newValue);
            }
            validateField(newValue);
          }}
        />
      </Input>
      <FormControlError>
        <FormControlErrorText>
          {isFormFieldInValid(fieldName, errors)}
        </FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
};

export default PrimaryTextFormField;
