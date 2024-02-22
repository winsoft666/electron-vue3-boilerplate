import axios from "axios";
import { PrepareAxios } from "../shared";

const axiosInstance = axios.create({
  // Always use Node.js adapter
  adapter: "http"
});

PrepareAxios(axiosInstance);

export default axiosInstance;