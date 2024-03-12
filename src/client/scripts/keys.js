import { randomBytes, pbkdf2 } from "crypto";
import { hex } from "@/utils.js";
import { hkdf } from "hkdf";
import { openDB } from "idb";

export function generate_secret_key() {
  return randomBytes(16)
    .toString("hex")
    .match(new RegExp(".{1,4}", "g"))
    .join("-")
    .toUpperCase();
}

export function display_secret_key(acc_id, secret) {
  const account_id = acc_id.toString(16).padStart(6, "0").toUpperCase();
  return `${account_id}-${secret}`;
}

export async function two_sk_derivation(pwd, secret, salt, user, info, uuid) {
  const pbkdf2Salt = await hkdf("sha512", salt, user, info, 32);
  const skMix = Buffer.from(
    await hkdf("sha512", secret, uuid, "SK-V1-HS512", 32)
  );

  return new Promise((resolve, reject) => {
    pbkdf2(pwd, pbkdf2Salt, 650000, 32, "sha512", (err, key) => {
      if (err) {
        reject(new Error(err));
      } else {
        resolve(hex.toBigInt(hex.buf_xor(key, skMix)));
      }
    });
  });
}

export function toCryptoKey(
  keyData,
  algorithm = "AES-GCM",
  extractable = false,
  keyUsages = ["encrypt", "decrypt"]
) {
  return window.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: algorithm },
    extractable,
    keyUsages
  );
}

export async function storeKey(name, key) {
  const db = await openDB("knox", 1, {
    upgrade(db) {
      db.createObjectStore("keys");
    },
  });

  await db.put("keys", key, name);
  db.close();
}

export async function getKey(name) {
  const db = await openDB("knox", 1, {
    upgrade(db) {
      db.createObjectStore("keys");
    },
  });

  const key = await db.get("keys", name);
  db.close();

  return key;
}
