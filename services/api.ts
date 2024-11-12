import { BASE_URL } from "@/config/env";
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/storage_keys";
import axios from "axios";
import { getItem, setItem } from "@/utils/secure_store";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the token to headers
api.interceptors.request.use(
  async (config) => {
    // console.log("requesting");
    let token = await getItem(AUTH_TOKEN_KEY);
    // console.log("token", token);
    // console.log(config);
    // await setItem(
    //   AUTH_TOKEN_KEY,
    //   "eyJhbGciOiJIUzUxMiJ9.eyJwYXNzd29yZCI6IjB6bHBrRko0SVRWZWhXSDNSeXRVTVByRTl3VlNHcUdaUUF3djRSNnIvOEk9Iiwicm9sZSI6WyJDVVNUT01FUiJdLCJpZCI6ImI5NGViMjg5LTU2M2UtNGEwNC1iNTU4LTEzNGNmMmI0YmQ3OCIsInVzZXJPcmdEZXRhaWxzIjp7ImxlYWRJZCI6IjVmZjg1NzNlLTJiYmQtNDdkNy1hNTFmLTA1MDkxYjgwOGRlNCIsIm9yZ0lkIjoiYjBiYzhiZTUtZTRlYi00NTAzLWE4MTMtMTNiOTdiNzZjNzczIiwib3JnRGVwYXJ0bWVudElkIjoiNGFiNjRkMDMtNDZiYy00MTIwLTkwNDUtOWJlM2MxNDcyODgzIiwib3JnRGVzaWduYXRpb25JZCI6IjZkODBkMWViLTViNTctNDk0ZS1iNzNhLWQ1ZTg3ODZlMDdjMCJ9LCJlbWFpbCI6ImN1c3RvbWVyMUBnbWFpbC5jb20iLCJ1c2VybmFtZSI6IlJhanUiLCJzdWIiOiJjdXN0b21lcjFAZ21haWwuY29tIiwiaWF0IjoxNzI1MTIxNTM2LCJleHAiOjE3MjUxNTAzMzZ9.ZbcUA1TvwwP177yCQqFPBsmDAUxL66XGP3d4nOaXxCkarmLrUANPZ57iR0Q8aZSxDt0JuTx0rKFDxK9XwQ5u2A",
    // );
    // const token =
    //   "eyJhbGciOiJIUzUxMiJ9.eyJwYXNzd29yZCI6Ikt2Qjl6dDIwQzd2SXBDcUlyVzBzRVBXczdSL3M3aWpqcnVhZHROY29GUWM9Iiwicm9sZSI6WyJTQUxFU19QRVJTT04iXSwiaWQiOiI4ODhiYmExMS04ZjAzLTQ4ZjctYmZlNS0xNTI1MTdhYmJmNDciLCJ1c2VyT3JnRGV0YWlscyI6eyJsZWFkSWQiOiI4MDE2MGRkZi1hZjJkLTQ5YmItOWM2Ny02MzNmZmJjN2M0ZmEiLCJvcmdJZCI6ImIwYmM4YmU1LWU0ZWItNDUwMy1hODEzLTEzYjk3Yjc2Yzc3MyIsIm9yZ0RlcGFydG1lbnRJZCI6ImY5MmFkN2Y1LWJmNzUtNGI0MS1iZTgzLTdhMjkxZTE1N2M2OSIsIm9yZ0Rlc2lnbmF0aW9uSWQiOiI1ZDQ1N2ZiNC04YWM0LTQ1NDgtYmFmMi04OThiY2UyNGM1YTYifSwiZW1haWwiOiJjaG93ZGFyeWxhc3lhODAxQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiTGFzeWEiLCJzdWIiOiJjaG93ZGFyeWxhc3lhODAxQGdtYWlsLmNvbSIsImlhdCI6MTcyOTQ5OTYxMiwiZXhwIjoxNzI5NTI4NDEyfQ.u1Sail9ADZccss2aOChdfleOVy_f-AmR9QOOOnW09I4vHcuk8rZWy7SVoWNpHjIMOFua_Ra7gWaqXnjBeGLp4Q";
    if (token) {
      try {
        await axios.post(BASE_URL + `/login/validate?token=${token}`, {});
        // console.log(validateResponse);
      } catch (e) {
        // console.error(e);
        const refreshToken = await getItem(REFRESH_TOKEN_KEY);
        const response = await axios.post(BASE_URL + "/auth/refresh-token", {
          token: refreshToken,
        });
        const newToken = response.data.token;
        await setItem(AUTH_TOKEN_KEY, newToken);
        token = newToken;
      }
      config.headers.Authorization = `Bearer ${token}`;
      // await removeItem(AUTH_TOKEN_KEY);
    }
    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors globally
// api.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     console.log("error -> ", error);
//     if (error.response && error.response.status === 401) {
//       console.error("Unauthorized, logging out...");
//     }
//     console.error("API Error:", error.response?.data);
//     return Promise.reject(error);
//   },
// );

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {

//     console.error(error);
//     const originalRequest = error.config;
//     if (
//       error.response &&
//       error.response.status === 401 &&
//       !originalRequest._retry
//     ) {
//       originalRequest._retry = true;
//       const refreshToken = await getItem(REFRESH_TOKEN_KEY);
//       const response = await api.post("/auth/refresh-token", {
//         token: refreshToken,
//       });
//       const newToken = response.data.token;

//       await setItem(AUTH_TOKEN_KEY, newToken);
//       api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
//       originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
//       return api(originalRequest);
//     }
//     return Promise.reject(error);
//   },
// );

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error(error);
    return Promise.reject(error);
  },
);

export default api;
