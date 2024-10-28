import { View, Text, KeyboardTypeOptions, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { isFormFieldInValid, setErrorValue } from "@/utils/helper";
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
import { TextCase } from "@/enums/enums";
import Feather from "@expo/vector-icons/Feather";

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
  textCase?: TextCase;
  inputType?: "text" | "password";
  className?: string;
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
  textCase = TextCase.freeform,
  inputType = "text",
  className = "",
}: PrimaryTextFormFieldProps) => {
  const [value, setValue] = useState<string>("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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

  const validateField = (newValue: string) => {
    if (isRequired && newValue.length === 0) {
      validateFieldFunc(fieldName, false);
      setErrorValue(
        fieldName,
        value,
        `Please enter a ${label.toLowerCase()}`,
        setErrors,
      );
      return;
    }
    const valLen = newValue.length;
    if (customValidations && valLen > 0) {
      const errorValidationMsg = customValidations(value);
      if (errorValidationMsg) {
        validateFieldFunc(fieldName, false);
        setErrorValue(fieldName, value, errorValidationMsg, setErrors);
        return;
      }
    }
    if (valLen > 0 && min && valLen < min) {
      validateFieldFunc(fieldName, false);
      // if this field is not valid set validField is false
      setErrorValue(
        fieldName,
        value,
        `Min. length should be ${min}`,
        setErrors,
      );
      return;
    }
    validateFieldFunc(fieldName, true);
    setErrorValue(fieldName, value, "", setErrors);
  };

  return (
    <FormControl
      key={fieldName}
      isInvalid={isFormFieldInValid(fieldName, errors).length > 0}
      className={className}
    >
      <FormControlLabel className="mb-1">
        <FormControlLabelText>{label}</FormControlLabelText>
        <FormControlLabelAstrick className="text-red-400 ms-0.5">
          {isRequired ? "*" : ""}
        </FormControlLabelAstrick>
      </FormControlLabel>
      <Input variant="outline" size="md">
        <InputField
          type={isPasswordVisible ? "text" : inputType}
          placeholder={placeholder}
          value={value}
          keyboardType={keyboardType}
          onChangeText={(newValue) => {
            // if expression not null and value matches the expressions(regular expressions)
            if (filterExp && !filterExp.test(newValue)) {
              return;
            }
            const valLen = newValue.length;
            let caseValue = newValue;
            if (max && valLen <= max) {
              switch (textCase) {
                case TextCase.uppercase:
                  caseValue = newValue.toUpperCase();
                  break;
                case TextCase.lowercase:
                  caseValue = newValue.toLowerCase();
                  break;
              }
              onChangeText(caseValue);
              setValue(caseValue);
            }
            validateField(caseValue);
          }}
        />
        {inputType === "password" ? (
          isPasswordVisible ? (
            <Pressable
              onPress={() => {
                setIsPasswordVisible(!isPasswordVisible);
              }}
            >
              <Feather name="eye" className="me-3" size={16} color="#9ca3af" />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => {
                setIsPasswordVisible(!isPasswordVisible);
              }}
            >
              <Feather
                name="eye-off"
                className="me-3"
                size={16}
                color="#6b7280"
              />
            </Pressable>
          )
        ) : (
          <></>
        )}
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
