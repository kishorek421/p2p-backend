import {
  OrgDepartmentMappingDetailsModel,
  OrgDesignationMappingDetailsModel,
} from "./org";
import { RoleModel } from "./rbac";

export interface EmployeeDetailsModel {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfJoining?: string;
  designationDetails?: OrgDesignationMappingDetailsModel;
  departmentDetails?: OrgDepartmentMappingDetailsModel;
  userRoleDetails: UserRoleDetailsModel;
}

export interface UserRoleDetailsModel {
  id?: string;
  userId?: string;
  roleDetails: RoleModel;
}
