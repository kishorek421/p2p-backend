import { ConfigurationModel } from "./configurations";
import {
  CityListItemModel,
  StateListItemModel,
  CountryListItemModel,
  PincodeListItemModel,
  AreaListItemModel,
} from "./geolocations";
import {
  OrgDepartmentMappingDetailsModel,
  OrgDesignationMappingDetailsModel,
  BranchDetailsModel,
  OrgDetailsModel,
} from "./org";

export interface CustomerLeadDetailsModel {
  id?: string;
  firstName?: string;
  lastName?: string;
  orgName?: string;
  description?: string;
  msmeNo?: string;
  orgMobile?: string;
  mobile?: string;
  alternateMobile?: string;
  email?: string;
  gstin?: string;
  address?: string;
  orgImage?: string;
  linksGenerated?: number;
  downloaded?: boolean;
  createdBy?: string;
  createdAt?: number;
  categoryOfOrgDetails?: ConfigurationModel;
  sizeOfOrgDetails?: ConfigurationModel;
  typeOfOrgDetails?: ConfigurationModel;
  cityDetails?: CityListItemModel;
  stateDetails?: StateListItemModel;
  countryDetails?: CountryListItemModel;
  pincodeDetails?: PincodeListItemModel;
  areaDetails?: AreaListItemModel;
  categoryOfOrgId?: string;
  sizeOfOrgId?: string;
  typeOfOrgId?: string;
  cityId?: string;
  stateId?: string;
  countryId?: string;
  pincodeId?: string;
  areaId?: string;
  onBoardingStatusDetails?: ConfigurationModel;
  isCustomerLead?: boolean;
}

export interface CustomerDetailsModel {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  alternateNumber?: string;
  mobileNumber?: string;
  address?: string;
  orgDepartmentMappingDetails?: OrgDepartmentMappingDetailsModel;
  orgDesignationMappingDetails?: OrgDesignationMappingDetailsModel;
  areaDetails?: AreaListItemModel;
  branchDetails?: BranchDetailsModel;
  orgDetails?: OrgDetailsModel;
}
