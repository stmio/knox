import axios from "axios";
import { signRequest } from "./keys.js";

axios.interceptors.request.use(
  (config) => {
    const timestamp = Math.floor(new Date().getTime() / 1000);

    const signature = signRequest(
      config.method,
      config.url,
      timestamp,
      config.data
    );

    config.headers["X-Request-Timestamp"] = timestamp;
    config.headers["X-Request-Signature"] = signature;

    return config;
  },
  (error) => {
    return Promise.reject(new Error(error));
  }
);

export { axios as api };
