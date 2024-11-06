import { Pressable, View, Text } from "react-native";
import DatePicker from "react-native-date-picker";
import { useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import moment from "moment";

interface PrimaryDatetimePickerFieldProps {
  selectedValue: string;
  setSelectedValue: any;
  placeholder: string;
  onSelect?: (value: string) => void;
  mode?: "date" | "datetime" | "time";
  format?: string;
}

const PrimaryDatetimePickerField = ({
  selectedValue,
  setSelectedValue,
  placeholder,
  onSelect,
  mode = "date",
  format,
}: PrimaryDatetimePickerFieldProps) => {
  // useEffect(() => {}, [selectedValue]);

  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable
        onPress={() => {
          setOpen(true);
        }}
      >
        <View className="border-gray-300 rounded border-[1px] flex-row justify-between px-3 py-2 items-center">
          {selectedValue.length === 0 ? (
            <Text className="flex-1 text-gray-400">{placeholder}</Text>
          ) : (
            <Text className="flex-1 text-gray-900">{selectedValue}</Text>
          )}
          <AntDesign name="calendar" size={20} color="#9ca3af" />
        </View>
      </Pressable>
      <DatePicker
        modal
        open={open}
        date={date}
        mode={mode}
        onConfirm={(date) => {
          let newFormat = format;
          if (format === undefined) {
            switch (mode) {
              case "date":
                newFormat = "YYYY-MM-DD";
                break;
              case "datetime":
                newFormat = "YYYY-MM-DD hh:mm:ss";
                break;
              case "time":
                newFormat = "hh:mm:ss a";
                break;
            }
          }
          const selectedDate = moment(date).format(newFormat);
          setSelectedValue(selectedDate);
          onSelect && onSelect(selectedDate);
          setOpen(false);
          setDate(date);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </View>
  );
};

export default PrimaryDatetimePickerField;
