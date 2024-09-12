const LOCAL_BASE_URL = "http://192.168.0.155:8089";
const DEV_BASE_URL = "http://43.205.35.224:8089";

enum ENVS {
  local,
  dev,
}

// let env: ENVS = ENVS.local;
let env: ENVS = ENVS.dev;

const getBaseURL = (iENV: ENVS) => {
  switch (iENV) {
    case ENVS.local:
      return LOCAL_BASE_URL;
    case ENVS.dev:
      return DEV_BASE_URL;
  }
};

export const BASE_URL = getBaseURL(env);
