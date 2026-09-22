import { axiosConfigHeader } from "../axiosConfigSendTypes";
import { apiToken } from "../instance";
import { jwtDecode } from "jwt-decode";

const ApiLoginByEmailAndPassword = async ({ payload }: any) => {
  try {
    const result = await apiToken.post("/auth/login", payload);
    if (result.status === 200) {
      const decodedToken = jwtDecode(result.data.accessToken) as any;
      const maxAge = decodedToken.exp - Math.floor(Date.now() / 1000);
      document.cookie = `auth=${JSON.stringify(
        result.data
      )}; path=/; max-age=${maxAge}`;
    }
    return result;
  } catch (error) {
    throw error;
  }
};

const ApiGetCurrentAccountRole = async () => {
  try {
    const result = await apiToken.get("/user/current");
    if (result.status === 200) {
      return result.data;
    }
  } catch (error) {
    console.log(">>> Api get current account role error: ", error);
  }
};

const ApiRegisterByEmailAndPassword = async ({ payload }: any) => {
  try {
    const result = await apiToken.post(
      "/auth/register",
      payload,
      axiosConfigHeader
    );
    return result;
  } catch (error) {
    throw error;
  }
};

const GetAccessToken = () => {
  const authCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("auth="));
  return authCookie ? JSON.parse(authCookie.split("=")[1])?.accessToken : null;
};

const GetCurrentUserId = () => {
  const accessToken = GetAccessToken();
  if (!accessToken) return null;
  try {
    const decoded = jwtDecode(accessToken) as any;
    return decoded.userID || null;
  } catch {
    return null;
  }
};

const ApiConfirmEmailAccount = async (payload: any) => {
  try {
    const result = await apiToken.post("/auth/verify-email", payload);
    return result;
  } catch (error) {
    throw error;
  }
};

const GetInformationOfUser = async (userId: number) => {
  try {
    const result = await apiToken.get(`/User/${userId}`, axiosConfigHeader);
    if (result.status === 200) {
      return result.data;
    }
  } catch (error) {
    console.log(">>> Api get information of user error: ", error);
  }
};

const ApiLoginWithGoogle = async (credential: string) => {
  try {
    const result = await apiToken.post(
      "/auth/login-google",
      `"${credential}"`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (result.status === 200) {
      const decodedToken = jwtDecode(result.data.accessToken) as any;
      const maxAge = decodedToken.exp - Math.floor(Date.now() / 1000);
      document.cookie = `auth=${JSON.stringify(
        result.data
      )}; path=/; max-age=${maxAge}`;
    }
    return result;
  } catch (error) {
    console.log(">>> Api login with google error: ", error);
  }
};

const ApiUpdatePassword = async ({ payload }: any) => {
  try {
    const response = await apiToken.post("/Authen/ChangePassword", payload);
    if (response?.status === 200) {
      return response;
    }
  } catch (error) {
    console.log(">>> Api update password error: ", error);
  }
};

const ApiGetUserInFormation = async () => {
  try {
    const response = await apiToken.get("/User/user-information");
    if (response?.status === 200) {
      return response?.data;
    }
  } catch (error) {
    console.log(">>> Api get user information error: ", error);
  }
};

export {
  ApiLoginByEmailAndPassword,
  ApiGetCurrentAccountRole,
  GetAccessToken,
  ApiRegisterByEmailAndPassword,
  ApiConfirmEmailAccount,
  GetInformationOfUser,
  ApiLoginWithGoogle,
  ApiUpdatePassword,
  ApiGetUserInFormation,
  GetCurrentUserId,
};
