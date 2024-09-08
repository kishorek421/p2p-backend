const LOCAL_BASE_URL = "http://192.0.0.2:8089";
const DEV_BASE_URL = "http://43.205.35.224:8089";

enum ENVS {
  local,
  dev,
}

let env: ENVS = ENVS.local;

const getBaseURL = (iENV: ENVS) => {
  switch (iENV) {
    case ENVS.local:
      return LOCAL_BASE_URL;
    case ENVS.dev:
      return DEV_BASE_URL;
  }
};

export const BASE_URL = getBaseURL(env);
