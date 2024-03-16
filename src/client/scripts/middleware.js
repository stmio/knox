import axios from "axios";
import { signRequest, verifyResponse } from "./keys.js";

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

axios.interceptors.response.use(
  (res) => {
    const timestamp = res.headers["x-response-timestamp"];
    const signature = res.headers["x-response-signature"];

    const validSignature = verifyResponse(
      signature,
      res.config.method,
      res.config.url,
      timestamp,
      res.data
    );

    if (!validSignature)
      return Promise.reject(new Error("Server sent an invalid signature"));
    else if (Math.floor(new Date().getTime() / 1000) - timestamp > 5)
      return Promise.reject(new Error("Response timestamp is too old"));
    else return res;
  },
  (error) => {
    return Promise.reject(new Error(error));
  }
);

export { axios as api };
