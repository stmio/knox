import { redis } from "../config/redis.js";
import { hex } from "../../utils.js";
import { createCipheriv } from "crypto";

export const encryptResponse = async (req, res, next) => {
  const { email, deviceID } = req.body;
  const session = await redis.hGet(`${email}:${deviceID}`, "SEK");

  const headers = res.getHeaders();
  const h_iv = crypto.getRandomValues(new Uint8Array(16));
  const h_cipher = createCipheriv("aes-256-gcm", hex.toBuffer(session), h_iv);

  res.header("iv", h_iv);
  res.header(
    "headers",
    Buffer.from(
      h_cipher.update(JSON.stringify(headers), "utf-8", "hex") +
        h_cipher.final("hex")
    ).toString("base64")
  );
  res.header("tag", h_cipher.getAuthTag().toString("base64"));

  const data = res.body;
  const d_iv = crypto.getRandomValues(new Uint8Array(16));
  const d_cipher = createCipheriv("aes-256-gcm", hex.toBuffer(session), d_iv);

  res.body = {
    iv: d_iv,
    enc_data: Buffer.from(
      d_cipher.update(JSON.stringify(data), "utf-8", "hex") +
        d_cipher.final("hex")
    ).toString("base64"),
    tag: d_cipher.getAuthTag().toString("base64"),
  };

  next();
};
