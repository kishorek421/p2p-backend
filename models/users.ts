import { ConfigurationModel } from "./configurations";
import { OrgDesignationMappingDetailsModel,OrgDepartmentMappingDetailsModel, OrgDetailsModel } from "./org";
import {CityListItemModel} from "./geolocations"

export interface CreateUserModel {
  firstName?: string;
  lastName?: string;
  mobile?: string;
  email?: string;
  departmentId?: string;
  designationId?: string;
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
  
}

export interface UserTicketDetailsModel{
  lastTicketStatus?: string;
  raisedTicketCount?: number ;
  closedTicketCount?: number ;
}
            

