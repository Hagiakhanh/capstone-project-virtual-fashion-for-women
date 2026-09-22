const axiosConfigHeader = {
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
};
const axiosConfigSendFileHeader = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
  withCredentials: true,
};
export { axiosConfigHeader, axiosConfigSendFileHeader };
