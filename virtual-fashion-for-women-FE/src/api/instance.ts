import axios from "axios";
import { GetAccessToken } from "./user/AuthenticationAPI";

const apiToken = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

apiToken.interceptors.request.use(
  (config) => {
    const accessToken = GetAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});
export {apiToken, api};
