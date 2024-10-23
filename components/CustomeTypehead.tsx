import { Text, Dimensions, Platform } from "react-native";
import React, { useEffect } from "react";
import {
  AutocompleteDropdown,
  AutocompleteDropdownItem,
} from "react-native-autocomplete-dropdown";
import Feather from "react-native-vector-icons/Feather";

const CustomeTypehead = ({
  type,
  onClearPress,
  selectedValue,
  suggestions,
  getSuggestions,
  setSelectedValue,
  loading,
  placeholder,
}: {
  type: any;
  onClearPress: (type: any) => void;
  selectedValue?: AutocompleteDropdownItem;
  suggestions: AutocompleteDropdownItem[];
  getSuggestions: (q: string, type: any) => void;
  setSelectedValue: any;
  loading: boolean;
  placeholder: string;
}) => {
  // const dropdownController = useRef(null);

  // const searchRef = useRef(null);

  // const onOpenSuggestionsList = useCallback((isOpened: boolean) => {}, []);

  // console.log(suggestions);

  useEffect(() => {
    console.log("selectedValue", selectedValue);
  }, [selectedValue]);

  return (
    <AutocompleteDropdown
      // ref={searchRef}
      // controller={(controller) => {
      //   dropdownController.current = controller;
      // }}
      initialValue={{ id: selectedValue?.id ?? "" }}
      direction={Platform.select({ ios: "down" })}
      dataSet={suggestions}
      onChangeText={(text: string) => {
        getSuggestions(text, type);
      }}
      onSelectItem={(item: any) => {
        console.log("item", item);
        item && setSelectedValue(item);
      }}
      debounce={600}
      suggestionsListMaxHeight={Dimensions.get("window").height * 0.4}
      onClear={() => {
        onClearPress(type);
      }}
      //  onSubmit={(e) => onSubmitSearch(e.nativeEvent.text)}
      //   onOpenSuggestionsList={onOpenSuggestionsList}
      loading={loading}
      useFilter={false} // set false to prevent rerender twice
      textInputProps={{
        placeholder: placeholder,
        autoCorrect: false,
        autoCapitalize: "none",
        style: {
          // borderRadius: 5,
          borderTopLeftRadius: 5,
          borderBottomLeftRadius: 5,
          backgroundColor: "#f2f2f2",
          // borderColor: "#8c8c8c",
          color: "#000000",
          paddingLeft: 12,
          fontSize: 14,
        },
      }}
      rightButtonsContainerStyle={{
        right: 0,
        paddingRight: 5,
        backgroundColor: "#f2f2f2",
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        alignSelf: "center",
      }}
      inputContainerStyle={{
        backgroundColor: "#d8d7d7",
        borderRadius: 5,
        // borderColor: "#8c8c8c",
        padding: 1,
      }}
      suggestionsListContainerStyle={{
        backgroundColor: "#fff",
      }}
      containerStyle={{
        flexGrow: 1,
        flexShrink: 1,
      }}
      renderItem={(item, text) => (
        <Text style={{ color: "#000", padding: 15 }}>{item.title}</Text>
      )}
      ChevronIconComponent={
        <Feather name="chevron-down" size={20} color="#8c8c8c" />
      }
      //   ClearIconComponent={<Feather name="x-circle" size={18} color="#fff" />}
      inputHeight={35}
      showChevron={true}
      closeOnBlur={false}
      showClear={true}
    />
  );
};

export default CustomeTypehead;
