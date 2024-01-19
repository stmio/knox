// This file defines utility functions which are used throughout the implementation.

// Functions to convert between BigInts, Buffers, and strings of hexadecimal.

function parseHexString(str, prefix = true) {
  const isHex = str.match(/^(0x)?([\da-fA-F]+)$/);
  if (!isHex) throw new Error("Input must be a hexadecimal string.");
  const hex = str.replace("0x", "");
  return prefix ? "0x" + hex : hex;
}

export function toHexString(hex) {
  if (typeof hex === "bigint") return hex.toString(16);
  else if (Buffer.isBuffer(hex)) return hex.toString("hex");
  else throw new Error("Function requires a Buffer or BigInt as input.");
}

export function toBigInt(str) {
  return BigInt(parseHexString(str.split(/\s/).join("")), 16);
}

export function toBuffer(str) {
  return Buffer.from(parseHexString(str, false), "hex");
}
