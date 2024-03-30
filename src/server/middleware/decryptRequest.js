import { redis } from "../config/redis.js";
import { hex } from "../../utils.js";
import { createDecipheriv } from "crypto";

function decryptHeaders(SEK, headers) {
  const h_iv = new Uint8Array(JSON.parse(`[${headers.iv}]`));
  const h_cipher = createDecipheriv("aes-256-gcm", hex.toBuffer(SEK), h_iv);
  h_cipher.setAuthTag(Buffer.from(headers.tag, "base64"));

  return JSON.parse(
    h_cipher.update(
      Buffer.from(headers.headers, "base64").toString("utf-8"),
      "hex",
      "utf-8"
    ) + h_cipher.final("utf-8")
  );
}

function decryptBody(SEK, body) {
  const d_iv = new Uint8Array(Object.values(body.iv));
  const d_cipher = createDecipheriv("aes-256-gcm", hex.toBuffer(SEK), d_iv);
  d_cipher.setAuthTag(Buffer.from(body.tag, "base64"));

  return JSON.parse(
    d_cipher.update(
      Buffer.from(body.data, "base64").toString("utf-8"),
      "hex",
      "utf-8"
    ) + d_cipher.final("utf-8")
  );
}

export const decryptRequest = async (req, res, next) => {
  const { email, deviceID } = req.body;
  const session = await redis.hGet(`${email}:${deviceID}`, "SEK");
  if (!session) return res.status(401).json({ err: "No valid session found" });

  req.headers = { ...req.headers, ...decryptHeaders(session, req.headers) };
  req.body = { ...req.body, ...decryptBody(session, req.body) };

  next();
};
