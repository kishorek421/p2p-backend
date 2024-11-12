import { View, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { OrgDropdownType } from "@/enums/enums";
import {
  BranchDetailsModel,
  OrgDepartmentMappingDetailsModel,
  OrgDesignationMappingDetailsModel,
} from "@/models/org";
import api from "@/services/api";
import {
  CREATE_USER,
  GET_BRANCHES_LIST,
  GET_DEPARTMENT_DROPDOWN_LIST,
  GET_DESIGNATION_DROPDOWN_BY_DEPARTMENT,
} from "@/constants/api_endpoints";
import { CreateUserModel } from "@/models/users";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import PrimaryTextFormField from "@/components/fields/PrimaryTextFormField";
import SubmitButton from "@/components/SubmitButton";
import { DropdownModel, ErrorModel } from "@/models/common";
import PrimaryDropdownFormField from "@/components/fields/PrimaryDropdownFormField";
import useRefresh from "@/hooks/useRefresh";

const CreateUser = () => {
  const [userModel, setUserModel] = useState<CreateUserModel>({});

  const [errors, setErrors] = useState<ErrorModel[]>([]);

  const [branches, setBranches] = useState<BranchDetailsModel[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<DropdownModel>({});

  const [departments, setDepartments] = useState<
    OrgDepartmentMappingDetailsModel[]
  >([]);
  const [selectedDepartment, setSelectedDepartment] = useState<DropdownModel>(
    {},
  );

  const [designations, setDesignations] = useState<
    OrgDesignationMappingDetailsModel[]
  >([]);
  const [selectedDesignation, setSelectedDesignation] = useState<DropdownModel>(
    {},
  );

  const { triggerRefresh } = useRefresh();

  const [isLoading, setIsLoading] = useState(false);

  // can validate fields
  const [canValidateField, setCanValidateField] = useState(false);

  const [fieldValidationStatus, setFieldValidationStatus] = useState<any>({});

  useEffect(() => {
    const fetchDepartments = () => {
      api
        .get(GET_DEPARTMENT_DROPDOWN_LIST, {})
        .then((response) => {
          setDepartments(response.data?.data ?? []);
        })
        .catch((e) => {
          console.error(e);
        });
    };

    const fetchBranches = () => {
      api
        .get(GET_BRANCHES_LIST, {})
        .then((response) => {
          setBranches(response.data?.data ?? []);
        })
        .catch((e) => {
          console.error(e);
        });
    };

    fetchDepartments();
    fetchBranches();
  }, []);

  const fetchDesignations = (departmentId: string) => {
    api
      .get(
        GET_DESIGNATION_DROPDOWN_BY_DEPARTMENT +
          `?departmentId=${departmentId}`,
        {},
      )
      .then((response) => {
        setDesignations(response.data?.data ?? []);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const createUser = async () => {
    const validationPromises = Object.keys(fieldValidationStatus).map(
      (key) =>
        new Promise((resolve) => {
          // Resolve each validation status based on field key
          setFieldValidationStatus((prev: any) => ({
            ...prev,
            [key]: resolve,
          }));
        }),
    );

    setCanValidateField(true);

    // Wait for all validations to complete
    await Promise.all(validationPromises);

    const allValid = errors
      .map((error) => error.message?.length === 0)
      .every((status) => status === true);

    if (allValid) {
      setIsLoading(true);

      setUserModel((prev) => {
        prev.departmentId = selectedDepartment?.value;
        prev.designationId = selectedDesignation?.value;
        prev.branchId = selectedBranch?.value;
        return prev;
      });

      setErrors([]);

      api
        .post(CREATE_USER, userModel)
        .then((response) => {
          // router.push({pathname: ""});
          console.log(response.data.data);
          Toast.show({
            type: "success",
            text1: "User created successfully",
            // text2: "Crendential have been sent to your email",
          });
          setIsLoading(false);
          setUserModel({});
          triggerRefresh();
          router.back();
        })
        .catch((e) => {
          console.error(e.response?.data);
          let errors = e.response?.data?.errors;
          if (errors) {
            console.error("errors -> ", errors);
            setErrors(errors);
          }
          setIsLoading(false);
        });
    }
  };

  const setFieldValidationStatusFunc = (
    fieldName: string,
    isValid: boolean,
  ) => {
    if (fieldValidationStatus[fieldName]) {
      fieldValidationStatus[fieldName](isValid);
    }
  };

  const onItemSelect = (type: any, e: any) => {
    switch (type) {
      case OrgDropdownType.BRANCH:
        let iSelectedBranch = branches.find((branch) => branch.id === e);
        setSelectedBranch({
          label: iSelectedBranch?.name,
          value: iSelectedBranch?.id,
        });
        break;
      case OrgDropdownType.DEPARTMENT:
        let iSelectedDepartment = departments.find(
          (department) => department.id === e,
        );
        setSelectedDepartment({
          label: iSelectedDepartment?.name,
          value: iSelectedDepartment?.id,
        });
        fetchDesignations(iSelectedDepartment?.id ?? "");
        break;
      case OrgDropdownType.DESIGNATION:
        let iSelectedDesignation = designations.find(
          (designation) => designation.id === e,
        );
        setSelectedDesignation({
          label: iSelectedDesignation?.name,
          value: iSelectedDesignation?.id,
        });
        break;
    }
  };

  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets={true}
      className="bg-white h-full"
    >
      <View className="px-4 mt-4 mb-4">
        <PrimaryTextFormField
          className="mb-3"
          fieldName="firstName"
          label="First Name"
          placeholder="Enter here"
          errors={errors}
          setErrors={setErrors}
          min={4}
          defaultValue={userModel.firstName}
          filterExp={/^[a-zA-Z ]*$/}
          canValidateField={canValidateField}
          setCanValidateField={setCanValidateField}
          setFieldValidationStatus={setFieldValidationStatus}
          validateFieldFunc={setFieldValidationStatusFunc}
          onChangeText={(value) => {
            setUserModel((prevState) => {
              prevState.firstName = value;
              return prevState;
            });
          }}
        />
        <PrimaryTextFormField
          className="mb-3"
          fieldName="lastName"
          label="Last Name"
          placeholder="Enter here"
          errors={errors}
          setErrors={setErrors}
          defaultValue={userModel.lastName}
          filterExp={/^[a-zA-Z ]*$/}
          canValidateField={canValidateField}
          setCanValidateField={setCanValidateField}
          setFieldValidationStatus={setFieldValidationStatus}
          validateFieldFunc={setFieldValidationStatusFunc}
          onChangeText={(value) => {
            setUserModel((prevState) => {
              prevState.lastName = value;
              return prevState;
            });
          }}
          isRequired={false}
        />
        <PrimaryTextFormField
          className="mb-3"
          fieldName="email"
          label="Email"
          placeholder="Enter here"
          defaultValue={userModel.email}
          errors={errors}
          setErrors={setErrors}
          min={8}
          keyboardType="email-address"
          filterExp={/^[A-Za-z0-9!#$%&'*+/=?^_{|}~.-@]*$/}
          canValidateField={canValidateField}
          setCanValidateField={setCanValidateField}
          setFieldValidationStatus={setFieldValidationStatus}
          validateFieldFunc={setFieldValidationStatusFunc}
          // customValidations={(value) => {
          //   const customRE = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
          //   if (!customRE.test(value)) {
          //     return "Please enter a valid email";
          //   }
          //   return undefined;
          // }}
          onChangeText={(value) => {
            setUserModel((prevState) => {
              prevState.email = value;
              return prevState;
            });
          }}
        />
        <PrimaryTextFormField
          className="mb-3"
          fieldName="mobile"
          label="Mobile No."
          placeholder="Enter here"
          defaultValue={userModel.mobile}
          errors={errors}
          setErrors={setErrors}
          min={10}
          max={10}
          keyboardType="phone-pad"
          filterExp={/^[0-9]*$/}
          canValidateField={canValidateField}
          setCanValidateField={setCanValidateField}
          setFieldValidationStatus={setFieldValidationStatus}
          validateFieldFunc={setFieldValidationStatusFunc}
          customValidations={(value) => {
            // mobile no should start with 6-9
            const customRE = /^[6-9]/;
            if (!customRE.test(value)) {
              return "Mobile no. should start with 6-9";
            }
            return undefined;
          }}
          onChangeText={(value) => {
            setUserModel((prevState) => {
              prevState.mobile = value;
              return prevState;
            });
          }}
        />
        <PrimaryDropdownFormField
          className="mb-3"
          options={branches.map((branch) => ({
            label: branch.name?.toString(),
            value: branch.id,
          }))}
          selectedValue={selectedBranch}
          setSelectedValue={setSelectedBranch}
          type={OrgDropdownType.BRANCH}
          placeholder="Select branch"
          fieldName="branchId"
          label="Branch"
          canValidateField={canValidateField}
          setCanValidateField={setCanValidateField}
          setFieldValidationStatus={setFieldValidationStatus}
          validateFieldFunc={setFieldValidationStatusFunc}
          errors={errors}
          setErrors={setErrors}
          onItemSelect={onItemSelect}
        />
        <PrimaryDropdownFormField
          className="mb-3"
          options={departments.map((department) => ({
            label: department.name?.toString(),
            value: department.id,
          }))}
          selectedValue={selectedDepartment}
          setSelectedValue={setSelectedDepartment}
          type={OrgDropdownType.DEPARTMENT}
          placeholder="Select department"
          fieldName="departmentId"
          label="Department"
          canValidateField={canValidateField}
          setCanValidateField={setCanValidateField}
          setFieldValidationStatus={setFieldValidationStatus}
          validateFieldFunc={setFieldValidationStatusFunc}
          errors={errors}
          setErrors={setErrors}
          onItemSelect={onItemSelect}
        />
        <PrimaryDropdownFormField
          className="mb-3"
          options={designations.map((designation) => ({
            label: designation.name?.toString(),
            value: designation.id,
          }))}
          selectedValue={selectedDesignation}
          setSelectedValue={setSelectedDesignation}
          type={OrgDropdownType.DESIGNATION}
          placeholder="Select designation"
          fieldName="designationId"
          label="Designation"
          canValidateField={canValidateField}
          setCanValidateField={setCanValidateField}
          setFieldValidationStatus={setFieldValidationStatus}
          validateFieldFunc={setFieldValidationStatusFunc}
          errors={errors}
          setErrors={setErrors}
          onItemSelect={onItemSelect}
        />
        <SubmitButton
          isLoading={isLoading}
          onPress={createUser}
          btnText="Create"
        />
      </View>
    </ScrollView>
  );
};

export default CreateUser;
