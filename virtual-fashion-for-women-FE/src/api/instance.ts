import axios from "axios";
import https from 'https';
import { NextRequest } from 'next/server';
import { GetAccessToken } from "./user/AuthenticationAPI";
export const getCurrentDomainUrl = (path: string = '') => {
  if (typeof window === 'undefined') return '';

  const baseUrl = window.location.origin; 
  return `${baseUrl}${path}`;
};
const apiToken = axios.create({
  baseURL: getCurrentDomainUrl("/api"),
});

apiToken.interceptors.request.use(
  (config) => {
    // const accessToken = GetAccessToken();
    // if (accessToken) {
    //   config.headers.Authorization = `Bearer ${accessToken}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

const api = axios.create({
  baseURL: '/api',
});

const createApiInstance = (request: Request) => {
  const agent = new https.Agent({
    rejectUnauthorized: false
  });

  const nextReq = request as NextRequest;
  const token = nextReq.cookies.get('token')?.value;

  // Lấy IP client từ header
  const clientIp =
    nextReq.headers.get('cf-connecting-ip') ||   // Cloudflare
    nextReq.headers.get('x-real-ip') ||          // Nginx / proxy
    nextReq.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
    '';

  console.log('👉 Client IP from Next.js:', clientIp);

  const api = axios.create({
    baseURL: process.env.API_URL,
    httpsAgent: process.env.NODE_ENV === 'production' ? undefined : agent,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'X-Client-IP': clientIp,   // gửi IP client
    },
  });

  return api;
}


export { apiToken, api, createApiInstance };
