// (auth)
export const LOGIN = "/login/user_login";
export const VALIDATE_TOKEN = "/login/validate";
export const REFRESH_TOKEN = "/login/refresh_token";

// configurations
export const GET_CONFIGURATIONS_BY_CATEGORY =
  "/configurations/getConfigurationsForDropdown";

// customer lead
export const GET_CUSTOMER_LEAD_DETAILS = "/customers/leads/view";


// customer
export const CREATE_CUSTOMER = "/customers/create";
export const GET_CUSTOMER_DETAILS = "/customers/view";

// geolocations
export const GET_PINCODES = "/geolocations/pincodes/getAllPincodesForDropdown";
export const GET_PINCODES_LIST_BY_PINCODE_SEARCH =
  "/geolocations/pincodes/getPincodesListByPincodeSearch";
export const GET_AREAS = "/geolocations/areas/getAllAreasForDropdown";
export const GET_AREAS_LIST_BY_NAME_SEARCH =
  "/geolocations/areas/getAreasListByNameSearch";
export const GET_CITIES = "/geolocations/cities/getAllCitiesForDropdown";
export const GET_CITIES_LIST_BY_NAME_SEARCH =
  "/geolocations/cities/getCitiesListByNameSearch";
export const GET_STATES = "/geolocations/states/getAllStatesForDropdown";
export const GET_STATES_LIST_BY_NAME_SEARCH =
  "/geolocations/states/getStatesListByNameSearch";
export const GET_COUNTRIES =
  "/geolocations/countries/getAllCountriesForDropdown";
export const GET_COUNTRIES_LIST_BY_NAME_SEARCH =
  "/geolocations/countries/getCountriesListByNameSearch";

// tickets
export const CREATE_TICKET = "/tickets/create";
export const GET_TICKETS_BY_STATUS_KEY =
  "tickets/customers/getTicketsByStatusKey";
export const TICKET_UPLOADS = "/tickets/upload";
export const GET_TICKET_DETAILS = "/tickets/getTicketById";

// assets
export const GET_ASSETS_IN_USE =
  "/assets/assetsInUse/getCustomerAssetsInUseListBySerialNoSearch";
export const GET_ISSUE_TYPES = "/assets/assetIssueType/getIssueTypesList";
export const GET_ASSET_MASTERS_LIST = "/assets/assetMaster/getAssetMastersList";
export const GET_ASSET_DETAILS = "/assets/assetMaster/getAssetMasterDetailsById";
export const CREATE_ASSET = "/assets/assetMaster/getAssetMastersList";
export const GET_ASSET_TYPES ="/assets/assetType/getAssetTypesList";
export const GET_ASSET_MODELS ="/assets/assetModel/getAssetModelsList";
export const GET_LICENSED_TYPES ="/configurations/getConfigurationsForDropdown";
export const GET_IMPACTS ="/configurations/getConfigurationsForDropdown";

// employees
export const GET_EMPLOYEES_LIST = "/employees/activeEmployee/list";
