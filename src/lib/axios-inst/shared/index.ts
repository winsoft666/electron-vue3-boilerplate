import { AxiosInstance } from "axios";

function PrepareAxios(axiosInst: AxiosInstance){
  axiosInst.defaults.baseURL = "";
  axiosInst.defaults.timeout = 3000;

  axiosInst.interceptors.request.use(
    config => {
      config.headers["repo"] = "https://github.com/winsoft666/electron-vue3-template";
      return config;
    },
    error => {
    // TODO: error handler
      return Promise.reject(error);
    }
  );

  axiosInst.interceptors.response.use(
    response => {
      return response;
    },
    error => {
    // TODO: error handler
      return Promise.reject(error);
    }
  );
}

export {
  PrepareAxios
};