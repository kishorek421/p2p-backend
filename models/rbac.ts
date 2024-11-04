export interface RoleModel {
  id?: string;
  name?: string;
  code?: string;
}

export interface RoleModulePermissionsModel {
  id?: string;
  name?: string;
  code?: string;
  path?: string;
  permissionCodes?: string[];
  subModules?: RoleModulePermissionsModel[];
}
