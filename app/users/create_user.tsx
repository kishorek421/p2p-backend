import { View, Text, ScrollView, Touchable, TouchableOpacity } from 'react-native'
import React, { useCallback, useState } from 'react'
import { TextInput } from 'react-native-gesture-handler'
import { FormControl, FormControlError, FormControlErrorText, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control'
import { Input, InputField } from '@/components/ui/input'
import { Button, ButtonText } from '@/components/ui/button'
import CustomeTypehead from '@/components/CustomeTypehead'
import { GeoLocationType, OrgDropdownType } from '@/enums/enums'
import { isFormFieldInValid } from '@/utils/helper'
import { OrgDepartmentMappingDetailsModel, OrgDesignationMappingDetailsModel, OrgDetailsModel } from '@/models/org'
import { AutocompleteDropdownItem } from 'react-native-autocomplete-dropdown'
import api from '@/services/api'
import { GET_DEPARTMENT_DROPDOWN, GET_ORG_DROPDOWN, GET_DESIGNATION_DROPDOWN, CREATE_CUSTOMER, CREATE_USER } from '@/constants/api_endpoints'
import { CreateUserModel } from '@/models/users'
import { router } from 'expo-router'
import Toast from 'react-native-toast-message'

const CreateUser = () => {

  // const [userModel , setUserModel]= useState<CreateUserModel>({});


  const [fNValue, setFNValue] = useState("");
  const [lNValue, setLNValue] = useState("");
  const [mNumber, setMNumber] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [errors, setErrors] = useState([]);

  const [orgs, setOrgs] = useState<AutocompleteDropdownItem[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<AutocompleteDropdownItem>();

  const [departs, setDeparts] = useState<AutocompleteDropdownItem[]>([]);
  const [selectedDept, setSelectedDept] = useState<AutocompleteDropdownItem>();

  const [designs, setDesigns] = useState<AutocompleteDropdownItem[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<AutocompleteDropdownItem>();

  const [autoCompleteLoading, setAutoCompleteLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const onClearPress = useCallback((type: OrgDropdownType) => {
    switch (type) {
      case OrgDropdownType.ORGANIZATION:
        setOrgs([]);
        break;
      case OrgDropdownType.DEPARTMENT:
        setDeparts([]);
        break;
      case OrgDropdownType.DESIGNATION:
        setDesigns([]);
        break;
    }
  }, []);



  const getDropdownSuggestionsUrl = (type: OrgDropdownType) => {
    switch (type) {
      case OrgDropdownType.ORGANIZATION:
        return GET_ORG_DROPDOWN;
      case OrgDropdownType.DEPARTMENT:
        return GET_DEPARTMENT_DROPDOWN;
      case OrgDropdownType.DESIGNATION:
        return GET_DESIGNATION_DROPDOWN;
      default:
        return "";
    }
  };

  const getSuggestions = useCallback(
    async (q: string, type: OrgDropdownType) => {
      console.log("getSuggestions", q);
      if (typeof q !== "string" || q.length < 3) {
        onClearPress(type);
        return;
      }
      setAutoCompleteLoading(true);

      const url = getDropdownSuggestionsUrl(type) + `?name=${q}`;
      console.log("url", url);
      
      api
        .get(url)
        .then((response) => {
          console.log("suggesgtions", response.data.data);
          setDropdownSuggestions(type, response.data?.data ?? []);
          setAutoCompleteLoading(false);
        })
        .catch((e) => {
          console.error(e);
          setAutoCompleteLoading(false);
        });

      // setAutoCompleteLoading(false);
    },
    [],
  );

  const setDropdownSuggestions = (
    type: OrgDropdownType,
    suggestionsList: any,
  ) => {
    switch (type) {
      case OrgDropdownType.ORGANIZATION:
        setOrgs(
          suggestionsList.map((item: OrgDetailsModel) => {
            const id = item.id;
            const title = item.name;
            if (id && title) {
              return {
                id: id,
                title: title.toString(),
              };
            }
          }),
        );
        break;
      case OrgDropdownType.DEPARTMENT:
        setDeparts(
          suggestionsList.map((item: OrgDepartmentMappingDetailsModel) => {
            const id = item.id;
            const title = item.name;
            if (id && title) {
              return {
                id: id,
                title: title.toString(),
              };
            }
          }),
        );
        break;
      case OrgDropdownType.DESIGNATION:
        setDesigns(
          suggestionsList.map((item: OrgDesignationMappingDetailsModel) => {
            const id = item.id;
            const title = item.name;
            if (id && title) {
              return {
                id: id,
                title: title.toString(),
              };
            }
          }),
        );
        break;
    }
  };

  const createUser = () => {
    let userModel: CreateUserModel = {
      firstName: fNValue,
      lastName: lNValue,
      mobile: mNumber,
      email: emailValue,
      orgId: selectedOrg?.id,
      departmentId: selectedDept?.id,
      designationId: selectedDesign?.id,
    };

    
    setErrors([]);

    api
      .post(CREATE_USER, userModel)
      .then((response) => {
        // router.push({pathname: ""});
        console.log(response.data.data);
        Toast.show({
          type: "success",
          text1: "Check your email",
          text2: "Crendential have been sent to your email",
        });
        setIsLoading(false);
        router.replace("/(auth)/login");
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

  return (
    <ScrollView automaticallyAdjustKeyboardInsets={true}>
      <View className='px-6 mt-2 mb-4 '>
        <FormControl
          isInvalid={isFormFieldInValid("firstName", errors).length > 0}
        >
          <FormControlLabel className="mb-1 p-1 mt-4 ">
            <FormControlLabelText>First Name</FormControlLabelText>
          </FormControlLabel>
          <Input variant='outline' size='md' >
            <InputField
              placeholder='Enter here'
              value={fNValue}
              onChangeText={
                (text) => {
                  const alphabeticRegex = /^[a-zA-Z\s]*$/;
                  if (alphabeticRegex.test(text)) {
                    setFNValue(text);
                  }
                }
              }
            />
          </Input>
          <FormControlError>
            <FormControlErrorText>
              {isFormFieldInValid("firstName", errors)}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl>
          <FormControlLabel className="mb-1 p-1 mt-4 ">
            <FormControlLabelText>Last Name</FormControlLabelText>
          </FormControlLabel>
          <Input variant='outline' size='md' >
            <InputField
              placeholder='Enter here '
              value={lNValue}
              onChangeText={
                (text) => {
                  const alphabeticRegex = /^[a-zA-Z\s]*$/;
                  if (alphabeticRegex.test(text)) {
                    setLNValue(text);
                  }
                }
              }
            />
          </Input>

        </FormControl>


        <FormControl>
          <FormControlLabel className="mb-1 p-1 mt-4 ">
            <FormControlLabelText>Mobile Number</FormControlLabelText>
          </FormControlLabel>
          <Input variant='outline' size='md' >
            <InputField
              placeholder='Enter here '
              keyboardType="numeric"
              value={mNumber}
              onChangeText={
                (text) => {
                  const numRegex = /^[0-9]*$/;
                  if (numRegex.test(text)) {
                    setMNumber(text);
                  }
                }
              }
            />
          </Input>

        </FormControl>
        <FormControl>
          <FormControlLabel className="mb-1 p-1 mt-4 ">
            <FormControlLabelText>Email Id</FormControlLabelText>
          </FormControlLabel>
          <Input variant='outline' size='md' >
            <InputField
              placeholder='customer@gmail.com'
              onChangeText={(text) => {
                setEmailValue(text);
              }}
            />
          </Input>
        </FormControl>

        {/* <FormControlLabel className='p-1 mt-4 mb-1' >
            <FormControlLabelText>Organization</FormControlLabelText>
          </FormControlLabel>
          <Input variant='outline' size='md'>
            <InputField />
          </Input>

          <FormControlLabel className='p-1 mt-4 mb-1' >
            <FormControlLabelText>Department</FormControlLabelText>
          </FormControlLabel>
          <Input variant='outline' size='md'>
            <InputField />
          </Input>

          <FormControlLabel className='p-1 mt-4 mb-1' >
            <FormControlLabelText>Designation</FormControlLabelText>
          </FormControlLabel>
          <Input variant='outline' size='md'>
            <InputField />
          </Input> */}

        <FormControl
          isInvalid={isFormFieldInValid("orgId", errors).length > 0}
        >
          <FormControlLabel className="mb-1 mt-4 p-1">
            <FormControlLabelText>Organization</FormControlLabelText>
          </FormControlLabel>
          <CustomeTypehead
            type={OrgDropdownType.ORGANIZATION}
            onClearPress={onClearPress}
            selectedValue={selectedOrg}
            suggestions={orgs}
            getSuggestions={getSuggestions}
            setSelectedValue={setSelectedOrg}
            loading={autoCompleteLoading}
            placeholder="Select organization"
          />
          <FormControlError>
            <FormControlErrorText>
              {isFormFieldInValid("orgId", errors)}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl
          isInvalid={isFormFieldInValid("deptId", errors).length > 0}
        >
          <FormControlLabel className="mb-1 mt-4 p-1">
            <FormControlLabelText>Department</FormControlLabelText>
          </FormControlLabel>
          <CustomeTypehead
            type={OrgDropdownType.DEPARTMENT}
            onClearPress={onClearPress}
            selectedValue={selectedDept}
            suggestions={departs}
            getSuggestions={getSuggestions}
            setSelectedValue={setSelectedDept}
            loading={autoCompleteLoading}
            placeholder="Select Department"
          />
          <FormControlError>
            <FormControlErrorText>
              {isFormFieldInValid("deptId", errors)}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl
          isInvalid={isFormFieldInValid("designationId", errors).length > 0}
        >
          <FormControlLabel className="mb-1 mt-4 p-1">
            <FormControlLabelText>Designation</FormControlLabelText>
          </FormControlLabel>
          <CustomeTypehead
            type={OrgDropdownType.DESIGNATION}
            onClearPress={onClearPress}
            selectedValue={selectedDesign}
            suggestions={designs}
            getSuggestions={getSuggestions}
            setSelectedValue={setSelectedDesign}
            loading={autoCompleteLoading}
            placeholder="Select Designation"
          />
          <FormControlError>
            <FormControlErrorText>
              {isFormFieldInValid("designationId", errors)}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <View className='p-1 mt-6 mb-1'>
          <Button className='bg-primary-950 rounded-lg h-12 shadow-sm'
           onPress={createUser}
           
          >
          <ButtonText className='text-white'>Submit</ButtonText>
          </Button>
        </View>
      </View >
    </ScrollView>

  )
}

export default CreateUser