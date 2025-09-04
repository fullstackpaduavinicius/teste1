import axios from "axios";

const base = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
export const http = axios.create({
  baseURL: `${base}/api`,     // <<<< acrescenta /api aqui
  withCredentials: true,      // envia/recebe o cookie cust_token
});
