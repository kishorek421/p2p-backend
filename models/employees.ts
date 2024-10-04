import { OrgDepartmentMappingDetailsModel, OrgDesignationMappingDetailsModel } from "./org";

export interface EmployeeDetailsModel {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfJoining?: string;
  designationDetails?: OrgDesignationMappingDetailsModel;
  departmentDetails?: OrgDepartmentMappingDetailsModel;
}
