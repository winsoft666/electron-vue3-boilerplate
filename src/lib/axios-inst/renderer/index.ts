import axios from "axios";
import { PrepareAxios } from "../shared";


const axiosInstance = axios.create();
PrepareAxios(axiosInstance);

export default axiosInstance;