export const ENV = "dev";

const DEV_BASE_URL = "http://43.205.35.224:8089";

export const BASE_URL = ENV === "dev" ? DEV_BASE_URL : "";
