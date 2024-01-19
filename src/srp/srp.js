import * as crypto from "crypto";
import * as utils from "../utils.js";
import { getParams } from "./params.js";

export const core = {};
export const client = {};
export const server = {};

// Use 1024-bit group if testing, use 4096-bit group otherwise
const group = process.env.NODE_ENV === "test" ? 1024 : 4096;
const params = getParams(group);

function hash(...args) {
  const H = crypto.createHash(params.hash);
  args.forEach((arg) => H.update(arg));
  return H.digest();
}

// a^x (mod N)
// All params are BigInts
function mod_exp(a, x, N) {
  if (N === 1n) return 0n;
  // TODO: assert (N - 1)^2 does not overflow base
  let res = 1n;
  a = a % N;

  while (x > 0n) {
    if (x % 2n === 1n) {
      res = (res * a) % N;
    }

    x = x >> 1n;
    a = (a ** 2n) % N;
  }

  return res;
}

client.derive_x = function(I, p, s) {
  const user_hash = hash(Buffer.concat([I, Buffer.from(":"), p]));
  return utils.hex.toBigInt(hash(s, user_hash));
}

client.derive_v = function(x) {
  return mod_exp(params.g, x, params.N);
}

