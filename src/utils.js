// This file defines utility functions which are used throughout the implementation.

// Functions to convert between BigInts, Buffers, and strings of hexadecimal.
export const hex = {};

hex.parseString = function(str, prefix = true) {
  const isHex = str.match(/^(0x)?([\da-fA-F]+)$/);
  if (!isHex) throw new Error("Input must be a hexadecimal string.");

  str = str.replace("0x", "");
  const hex = str.length % 2 ? "0" + str : str;
  return prefix ? "0x" + hex : hex;
}

hex.toString = function(b) {
  if (typeof b === "bigint") return b.toString(16);
  else if (Buffer.isBuffer(b)) return b.toString("hex");
  else throw new Error("Function requires a Buffer or BigInt as input.");
}

hex.toBigInt = function(str) {
  str = (typeof str === "string") ? str : hex.toString(str);
  return BigInt(hex.parseString(str.split(/\s/).join("")), 16);
}

hex.toBuffer = function(str) {
  str = (typeof str === "string") ? str : hex.toString(str);
  return Buffer.from(
    hex.parseString(str.split(/\s/).join(""), false), "hex"
  );
}

