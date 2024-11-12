import { ConfigurationModel } from "./configurations";
import {
  OrgDesignationMappingDetailsModel,
  OrgDepartmentMappingDetailsModel,
  OrgDetailsModel,
} from "./org";

export interface CreateUserModel {
  firstName?: string;
  lastName?: string;
  mobile?: string;
  email?: string;
  departmentId?: string;
  designationId?: string;
  branchId?: string;
  orgId?: string;
}

export interface UserDetailsModel {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  statusDetails?: ConfigurationModel;
  userTypeDetails?: ConfigurationModel;
  orgDetails?: OrgDetailsModel;
  orgDesignationDetails?: OrgDesignationMappingDetailsModel;
  orgDepartmentDetails?: OrgDepartmentMappingDetailsModel;
  ticketDetails?: UserTicketDetailsModel;
  departmentDetails?: OrgDepartmentMappingDetailsModel;
  designationDetails?: OrgDesignationMappingDetailsModel;
}

export interface UserTicketDetailsModel {
  lastTicketStatus?: string;
  raisedTicketCount?: number;
  closedTicketCount?: number;
}

export interface OrgUserListItemModel {
  id?: string;
  name?: string;
}
