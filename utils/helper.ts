import { ErrorModel } from "@/models/common";

export const isFormFieldInValid = (
  name: string,
  errors: ErrorModel[],
): string => {
  let msg = "";
  for (const error of errors) {
    if (error.param === name) {
      msg = error.message ?? "";
    }
  }
  return msg;
};

export const getFileName = (uri: string, isFullName = false) => {
  const splits = uri.split("/");
  const fileName = splits[splits.length - 1];
  return isFullName
    ? fileName
    : fileName.length > 17
      ? fileName.substring(17) + "..."
      : fileName;
};

export const getDeviceStatusColor = (status?: string) => {
  switch (status) {
    case "IN_USE":
      return "text-primary-900 bg-primary-200 "
    case "NOT_IN_USE":
      return "text-red-500 bg-red-200"
    default: return "text-grey-500"
  }
}