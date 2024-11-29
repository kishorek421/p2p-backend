import { View, Image, TouchableOpacity, Text } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { isFormFieldInValid, setErrorValue } from "@/utils/helper";
import ImagePickerComponent from "../ImagePickerComponent";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlLabelAstrick,
  FormControlError,
  FormControlErrorText,
} from "../ui/form-control";
import { ErrorModel } from "@/models/common";
import AntDesign from "@expo/vector-icons/AntDesign";

interface ImageFormFieldProps {
  errors: ErrorModel[];
  setErrors: any;
  imagePath: string;
  setImagePath: any;
  label: string;
  fieldName: string;
  canValidateField: boolean;
  setCanValidateField: any;
  setFieldValidationStatus: any;
  validateFieldFunc: (fieldName: string, isValid: boolean) => void;
  isRequired?: boolean;
}

const ImageFormField = ({
  label,
  fieldName,
  errors,
  setErrors,
  imagePath,
  setImagePath,
  canValidateField,
  setCanValidateField,
  validateFieldFunc,
  setFieldValidationStatus,
  isRequired = true,
}: ImageFormFieldProps) => {
  const bottomSheetRef = useRef(null);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleImagePicker = () => {
    setIsModalVisible(!isModalVisible);
    if (!isModalVisible) {
      bottomSheetRef.current?.show();
    } else {
      bottomSheetRef.current?.hide();
    }
  };

  useEffect(() => {
    setFieldValidationStatus((prevState: any) => ({
      ...prevState,
      [fieldName]: null,
    }));
  }, []);

  useEffect(() => {
    if (canValidateField) {
      validateField(imagePath);
      setCanValidateField(false);
    }
  }, [canValidateField]);

  const validateField = (newValue: string) => {
    if (isRequired && newValue.length === 0) {
      validateFieldFunc(fieldName, false);
      setErrorValue(
        fieldName,
        newValue ?? "",
        `Please choose a ${label.toLowerCase()}`,
        setErrors,
      );
      return;
    }
    validateFieldFunc(fieldName, true);
    setErrorValue(fieldName, newValue ?? "", "", setErrors);
  };

  return (
    <FormControl isInvalid={isFormFieldInValid(fieldName, errors).length > 0}>
      <FormControlLabel className="mb-1">
        <FormControlLabelText>{label}</FormControlLabelText>
        <FormControlLabelAstrick className="text-red-400 ms-0.5">
          *
        </FormControlLabelAstrick>
      </FormControlLabel>
      <ImagePickerComponent
        onImagePicked={(uri: string) => {
          setImagePath(uri);
        }}
        setIsModalVisible={setIsModalVisible}
        bottomSheetRef={bottomSheetRef}
      />
      {imagePath ? (
        <View>
          <Image
            source={{ uri: imagePath }}
            className="w-full h-36 rounded-xl absolute"
          />
          <View className="w-full flex items-end gap-4 h-36 shadow-soft-2  rounded-xl">
            <TouchableOpacity
              className="mt-2 me-2"
              onPress={() => {
                setImagePath("");
              }}
            >
              <AntDesign name="closecircle" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity onPress={() => toggleImagePicker()}>
          <View
            className={`${isFormFieldInValid(fieldName, errors).length === 0 ? "border-primary-950" : "border-red-700"} border-[1px] border-dashed h-32 rounded-md mt-1 flex justify-center items-center`}
          >
            <View className="flex justify-center items-center mt-3">
              <View
                className={`${isFormFieldInValid(fieldName, errors).length === 0 ? "bg-primary-300" : "bg-red-300"} rounded-md p-2 bg-primary-300 w-auto`}
              >
                <AntDesign
                  name="upload"
                  color={`${isFormFieldInValid(fieldName, errors).length === 0 ? "#009c68" : "#b91c1c"}`}
                  size={18}
                />
              </View>
              <Text
                className={`${isFormFieldInValid(fieldName, errors).length === 0 ? "text-primary-950" : "text-red-600"}`}
              >
                Choose Image
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
      <FormControlError>
        <FormControlErrorText>
          {isFormFieldInValid(fieldName, errors)}
        </FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
};

export default ImageFormField;
