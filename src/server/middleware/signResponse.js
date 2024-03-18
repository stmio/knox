import { redis } from "../config/redis.js";
import { hex } from "../../utils.js";
import { createHmac } from "crypto";

function sign(SAK, method, url, timestamp, body) {
  const HMAC = createHmac("sha512", hex.toBuffer(SAK));
  HMAC.update(`${method.toUpperCase()}${url}${timestamp.toString()}${body}`);

  return HMAC.digest("base64");
}

export const signResponse = async (req, res, next) => {
  const { email, deviceID } = req.body;
  const session = await redis.hGet(`${email}:${deviceID}`, "SAK");
  if (!session) return res.status(401).json({ err: "No valid session found" });

  const timestamp = Math.floor(new Date().getTime() / 1000);
  const signature = sign(
    session,
    req.method,
    req.originalUrl,
    timestamp,
    res.body
  );

  res.header("x-response-timestamp", timestamp);
  res.header("x-response-signature", signature);

  next();
};
