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
  keyboardType = "default",
  onChangeText,
  min,
  max = 50,
  filterExp,
  customValidations,
}: PrimaryTextFormFieldProps) => {
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

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
          onChangeText={(value) => {
            // if expression not null and value matches the expressions(regular expressions)
            if (filterExp && !filterExp.test(value)) {
              return;
            }
            onChangeText(value);
            const valLen = value.length;
            if (max && valLen <= max) {
              setValue(value);
            }
            if (customValidations) {
              const errorValidationMsg = customValidations(value);
              if (errorValidationMsg) {
                setErrorValue(fieldName, value, errorValidationMsg);
                return;
              } else {
                setErrorValue(fieldName, value, "");
              }
            }
            if (min) {
              if (valLen < min) {
                setErrorValue(fieldName, value, `Min. length should be ${min}`);
                return;
              } else {
                setErrorValue(fieldName, value, "");
              }
            }
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
