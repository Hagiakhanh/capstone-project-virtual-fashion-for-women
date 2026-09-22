import { api, apiToken } from "../instance";
// import api from "../instance";

const ApiGetProducts = async (pageIndex: number, pageSize: number) => {
  try {
    // const result = await apiToken.get("/products"); // CSR
    const result = await api.get("/products"); // SSR
    if (result.status === 200) {
      return result.data;
    }
  } catch (error) {
    console.log(">>> Api get products error: ", error);
  }
};
export { ApiGetProducts };
