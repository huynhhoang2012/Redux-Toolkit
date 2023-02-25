import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// create an axios instance
const service = axios.create({
  baseURL: "URL_API", // url = base url + request url
  timeout: 300000, // request timeout
});

// request interceptor
service.interceptors.request.use(
  (config) => {
    config.params = config.params || {};

    config.headers["Content-Type"] = "application/json";

    if (config.token) {
      config.headers.token = config.token;
      config.headers.Authorization = `Bearer ${config.token}`;
    }

    if (config.isFormData) {
      config.headers["Content-Type"] =
        "multipart/form-data; boundary=<calculated when request is sent>";
    }

    return config;
  },
  (error) => {
    return error;
  }
);

// response interceptor
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res?.data?.status === 401) {
      AsyncStorage.setItem("token_expires", true);
    }

    return res;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default service;
