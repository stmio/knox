import { randomBytes, pbkdf2, createHmac } from "crypto";
import { hex } from "@/utils.js";
import { hkdf } from "hkdf";
import { openDB } from "idb";

const session = {};

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

export function generateKeychain(AUK) {
  const webCrypto = window.crypto.subtle;

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const keychain = { uuid: crypto.randomUUID(), iv: iv };

  return new Promise(async (resolve, reject) => {
    const KEK = await webCrypto.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );

    const { publicKey, privateKey } = await webCrypto.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 4096,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: "SHA-512",
      },
      true,
      ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );

    const VEK = await webCrypto.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    const exportedKeys = [
      // Export RSA key pair (private encrypted with KEK)
      webCrypto
        .exportKey("jwk", publicKey)
        .then((jwk) => (keychain.public = jwk)),
      webCrypto
        .wrapKey("jwk", privateKey, KEK, {
          name: "AES-GCM",
          iv: iv,
        })
        .then((jwk) => (keychain.private = new Uint8Array(jwk))),

      // Export Vault Encryption Key (encrypted with RSA pair)
      webCrypto
        .wrapKey("jwk", VEK, publicKey, { name: "RSA-OAEP" })
        .then((jwk) => (keychain.vek = new Uint8Array(jwk))),

      // Export Keychain Encryption Key (encrypted with AUK)
      webCrypto
        .wrapKey("jwk", KEK, AUK, { name: "AES-GCM", iv: iv })
        .then((jwk) => (keychain.kek = new Uint8Array(jwk))),
    ];

    Promise.all(exportedKeys)
      .then(() => resolve(keychain))
      .catch((err) => reject(err));
  });
}

function parseKeychain(keychain) {
  keychain = JSON.parse(keychain);

  for (const key in keychain) {
    // Needs converting to Uint8Array or ArrayBuffer
    if (typeof keychain[key] === "object" && keychain[key][0]) {
      if (key === "iv")
        keychain[key] = new Uint8Array(Object.values(keychain[key]));
      else keychain[key] = new Uint8Array(Object.values(keychain[key])).buffer;
    }
  }

  return keychain;
}

export async function loadKeychain(keychain, AUK) {
  if (typeof keychain === "string") keychain = parseKeychain(keychain);
  else keychain = structuredClone(keychain);

  const webCrypto = window.crypto.subtle;

  keychain.public = await webCrypto.importKey(
    "jwk",
    keychain.public,
    {
      name: "RSA-OAEP",
      hash: "SHA-512",
    },
    false,
    ["encrypt", "wrapKey"]
  );

  keychain.kek = await webCrypto.unwrapKey(
    "jwk",
    keychain.kek,
    AUK,
    {
      name: "AES-GCM",
      iv: keychain.iv,
    },
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt", "unwrapKey"]
  );

  keychain.private = await webCrypto.unwrapKey(
    "jwk",
    keychain.private,
    keychain.kek,
    { name: "AES-GCM", iv: keychain.iv },
    { name: "RSA-OAEP", hash: "SHA-512" },
    false,
    ["decrypt", "unwrapKey"]
  );

  keychain.vek = await webCrypto.unwrapKey(
    "jwk",
    keychain.vek,
    keychain.private,
    { name: "RSA-OAEP" },
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );

  return keychain;
}

export async function generateVault(keychain, AUK, email, pwd) {
  const VEK = (await loadKeychain(keychain, AUK)).vek;

  const vault = JSON.stringify([
    {
      name: "Knox",
      url: "https://knox.com",
      email: email,
      pwd: pwd,
    },
  ]);

  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const data = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    VEK,
    enc.encode(vault)
  );

  return {
    data: new Uint8Array(data),
    iv: iv,
    uuid: crypto.randomUUID(),
  };
}

export async function encryptVault(VEK, vault, uuid) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const data = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    VEK,
    enc.encode(JSON.stringify(vault))
  );

  return {
    data: new Uint8Array(data),
    iv: iv,
    uuid: uuid,
  };
}

function parseVault(vault) {
  for (const i in vault) {
    if (i !== "uuid") {
      vault[i] = new Uint8Array(Object.values(JSON.parse(vault[i])));
    }
  }

  return vault;
}

export async function loadVault(VEK, vault) {
  vault = parseVault(vault);
  const decoder = new TextDecoder();

  const data = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: vault.iv },
    VEK,
    vault.data
  );

  return JSON.parse(decoder.decode(data));
}

export function signRequest(method, url, timestamp, body) {
  const HMAC = createHmac("sha512", hex.toBuffer(session.SAK));
  HMAC.update(`${method.toUpperCase()}${url}${timestamp.toString()}${body}`);

  return HMAC.digest("base64");
}

export function verifyResponse(signature, method, url, timestamp, body) {
  const HMAC = createHmac("sha512", hex.toBuffer(session.SAK));
  HMAC.update(`${method.toUpperCase()}${url}${timestamp.toString()}${body}`);

  return signature === HMAC.digest("base64");
}

function loadStoredSession() {
  const userSession = JSON.parse(sessionStorage.getItem("session"));

  Object.assign(session, {
    K: hex.toBigInt(userSession?.K || 0n),
    SEK: hex.toBigInt(userSession?.SEK || 0n),
    SAK: hex.toBigInt(userSession?.SAK || 0n),
    identity: userSession?.identity,
    device: userSession?.deviceID,
    userID: userSession?.userID,
  });
}

export function getUserSession() {
  if (window.location.pathname === "/register/") loadStoredSession();
  return session.K === 0n ? null : session;
}

// Check if on vault page when keys script is loaded
if (window.location.pathname === "/vault/") {
  loadStoredSession();
  sessionStorage.removeItem("session");
}
