export function toBigInt(str) {
  return BigInt("0x" + str.split(/\s/).join(""), 16);
}

