import axios from "axios";
import https from 'https';
import { NextRequest } from 'next/server';
import { GetAccessToken } from "./user/AuthenticationAPI";

const apiToken = axios.create({
  baseURL: process.env.API_URL,
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
  baseURL: '/api',
});

const createApiInstance = (request: Request) => {
  // Phải bỏ cái này khi deploy lên server có SSL
  // Vì nó chỉ dùng để test trên localhost thôi
  const agent = new https.Agent({
    rejectUnauthorized: false
  });

  const token = (request as NextRequest).cookies.get('token')?.value;

  const api = axios.create({
    baseURL: process.env.API_URL,
    httpsAgent: process.env.NODE_ENV === 'production' ? undefined : agent,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  })

  return api;
}

export { apiToken, api, createApiInstance };
