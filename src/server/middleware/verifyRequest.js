import { redis } from "../config/redis.js";
import { hex } from "../../utils.js";
import { createHmac } from "crypto";

function verifySignature(signature, SAK, method, url, timestamp, body) {
  const HMAC = createHmac("sha512", hex.toBuffer(SAK));
  HMAC.update(`${method.toUpperCase()}${url}${timestamp.toString()}${body}`);

  return signature === HMAC.digest("base64");
}

export const verifyRequest = async (req, res, next) => {
  const { email, deviceID } = req.body;
  const session = await redis.hGet(`${email}:${deviceID}`, "SAK");
  if (!session) return res.status(401).json({ err: "No valid session found" });

  const signature = req.headers["x-request-signature"];
  const timestamp = req.headers["x-request-timestamp"];

  const validSignature = verifySignature(
    signature,
    session,
    req.method,
    req.originalUrl,
    timestamp,
    req.body
  );

  if (!validSignature) {
    res.status(401).json({ err: "Request is not signed correctly" });
  } else if (Math.floor(new Date().getTime() / 1000) - timestamp > 5) {
    res.status(400).json({ err: "Request timestamp is too old" });
  } else next();
};
