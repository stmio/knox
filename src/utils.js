// This file defines utility functions which are used throughout the implementation.

// Functions to convert between BigInts, Buffers, and strings of hexadecimal.
export const hex = {};

hex.parseString = function (str, prefix = true) {
  const isHex = str.match(/^(0x)?([\da-fA-F]+)$/);
  if (!isHex) throw new Error("Input must be a hexadecimal string.");

  str = str.replace("0x", "");
  const hex = str.length % 2 ? "0" + str : str;
  return prefix ? "0x" + hex : hex;
};

hex.toString = function (b) {
  if (typeof b === "bigint") return b.toString(16);
  else if (Buffer.isBuffer(b)) return b.toString("hex");
  else throw new Error("Function requires a Buffer or BigInt as input.");
};

hex.toBigInt = function (str) {
  str = typeof str === "string" ? str : hex.toString(str);
  return BigInt(hex.parseString(str.split(/\s/).join("")), 16);
};

hex.toBuffer = function (str) {
  str = typeof str === "string" ? str : hex.toString(str);
  return Buffer.from(hex.parseString(str.split(/\s/).join(""), false), "hex");
};

// Bitwise XOR of two buffers
hex.buf_xor = function (a, b) {
  const len = Math.max(a.length, b.length);
  const buf = Buffer.alloc(len);

  for (let i = 0; i < len; i++) {
    buf[i] = a[i] ^ b[i];
  }

  return buf;
};

export function isEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

export function isUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

export function validatePassword(pwd) {
  if (pwd.length < 14)
    return { status: false, msg: "Password must be at least 14 characters" };
  if (!/[A-Z]/.test(pwd))
    return { status: false, msg: "Password must contain an uppercase letter" };
  if (!/[a-z]/.test(pwd))
    return { status: false, msg: "Password must contain a lowercase letter" };
  if (!/\d/.test(pwd))
    return { status: false, msg: "Password must contain a number" };

  return { status: true };
}
