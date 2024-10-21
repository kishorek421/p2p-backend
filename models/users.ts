import { OrgDepartmentMappingDetailsModel, OrgDesignationMappingDetailsModel } from "./org";
export interface CreateUserModel
{
    firstName?: string;
    lastName?: string;
    mobile?: string;
    email?: string;
    departmentId?: string;
    designationId?: string;
    orgId?: string;

}

export interface UserDetailsModel
{
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    dateOfJoining?: string;
    designationDetails?: OrgDesignationMappingDetailsModel;
    departmentDetails?: OrgDepartmentMappingDetailsModel;

}