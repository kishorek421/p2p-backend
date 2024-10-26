import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { ChevronDownIcon } from "@/components/ui/icon";
import { ConfigurationModel } from "@/models/configurations";
import { useEffect, useState } from "react";
import { GET_CONFIGURATIONS_BY_CATEGORY } from "@/constants/api_endpoints";
import api from "@/services/api";

interface ConfigurationDropdownFieldProps {
  configurationCategory: string;
  selectedConfig: ConfigurationModel;
  setSelectedConfig: any;
  placeholder: string;
}

const ConfigurationDropdownField = ({
  configurationCategory,
  selectedConfig,
  setSelectedConfig,
  placeholder,
}: ConfigurationDropdownFieldProps) => {
  const [options, setOptions] = useState<ConfigurationModel[]>([]);

  useEffect(() => {
    const fetchOptions = () => {
      api
        .get(GET_CONFIGURATIONS_BY_CATEGORY, {
          params: {
            category: configurationCategory,
          },
        })
        .then((response) => {
          setOptions(response.data?.data ?? []);
        })
        .catch((e) => {
          console.error(e);
          setOptions([]);
        });
    };

    fetchOptions();
  }, []);

  return (
    <Select
      className="w-full"
      selectedValue={selectedConfig.id}
      onValueChange={(e) => {
        let config = options.find((option) => e === option.id);
        if (config) {
          setSelectedConfig(config);
        }
      }}
    >
      <SelectTrigger variant="outline" size="md">
        <SelectInput
          className="w-96"
          placeholder={placeholder}
          value={selectedConfig.value}
        />
        <SelectIcon className="mr-3 " as={ChevronDownIcon} />
      </SelectTrigger>
      <SelectPortal>
        <SelectBackdrop />
        <SelectContent>
          <SelectDragIndicatorWrapper>
            <SelectDragIndicator />
          </SelectDragIndicatorWrapper>
          {options &&
            options.map((value) => (
              <SelectItem
                label={value.value ?? "-"}
                value={value.id ?? ""}
                key={value.id}
              />
            ))}
        </SelectContent>
      </SelectPortal>
    </Select>
  );
};

export default ConfigurationDropdownField;
