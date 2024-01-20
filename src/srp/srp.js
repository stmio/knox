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

// Left-pads buffer until its length matches N
function pad(n) {
  const len = utils.hex.toBuffer(params.N).length;
  const buf = Buffer.alloc(len - n.length);
  return Buffer.concat([buf, n]);
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

core.derive_k = function() {
  return utils.hex.toBigInt(
    hash(
      utils.hex.toBuffer(params.N),
      pad(utils.hex.toBuffer(params.g))
    )
  );
}

// Used for generating the random values of the private keys a, b.
// TODO: add test?
core.get_private_ephemeral_key = function(bitLength = 512) {
  if (bitLength < 256)
    throw new Error("Must have a bit length of at least the recommended 256-bits.");
  return utils.hex.toBigInt(crypto.randomBytes(bitLength / 8));
}

client.derive_x = function(I, p, s) {
  const user_hash = hash(Buffer.concat([I, Buffer.from(":"), p]));
  return utils.hex.toBigInt(hash(s, user_hash));
}

client.derive_v = function(x) {
  return mod_exp(params.g, x, params.N);
}

client.derive_A = function(a) {
  return mod_exp(params.g, a, params.N);
}

server.derive_B = function(b, v, k) {
  return (k * v + mod_exp(params.g, b, params.N)) % params.N;
}

