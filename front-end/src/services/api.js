import axios from "axios";

export const BASE_URL = "http://localhost:5000";

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;