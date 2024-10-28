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

// error -> {value(current), message(mistake in the current value), param(in which parameter)}
// {value, message, param} -> [errors]

export const setErrorValue = (
  param: string,
  value: string,
  msg: string,
  setErrors: any,
) => {
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
      return "text-primary-900 bg-primary-200 ";
    case "NOT_IN_USE":
      return "text-red-500 bg-red-200";
    default:
      return "text-grey-500";
  }
};
