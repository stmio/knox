import * as crypto from "crypto";
import * as utils from "../utils.js";
import { getParams } from "./params.js";

export const core = {};
export const client = {};
export const server = {};

// TODO: check extra mod N is needed in some places
// TODO: make function I/O datatypes consistent

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

// Bitwise XOR of two buffers
function buf_xor(a, b) {
  const len = Math.max(a.length, b.length);
  const buf = Buffer.alloc(len);

  for (let i = 0; i < len; i++) {
    buf[i] = a[i] ^ b[i];
  }

  return buf;
}

// In JavaScript, % is the remainder operator, not the modulus.
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
function mod(n, d) {
  return ((n % d) + d) % d;
}

// a^x (mod N)
// All params are BigInts
function mod_exp(a, x, N) {
  if (N === 1n) return 0n;
  // TODO: assert (N - 1)^2 does not overflow base
  let res = 1n;
  a = mod(a, N);

  while (x > 0n) {
    if (mod(x, 2n) === 1n) {
      res = mod(res * a, N);
    }

    x = x >> 1n;
    a = mod(a ** 2n, N);
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

core.derive_u = function(A, B) {
  const u = hash(
    pad(utils.hex.toBuffer(A)),
    pad(utils.hex.toBuffer(B))
  );

  return utils.hex.toBigInt(u);
}

core.derive_K = function(S) {
  return hash(utils.hex.toBuffer(S));
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

client.derive_S = function(k, x, a, B, u) {
  if (mod(B, params.N) === 0n || u === 0n)
    throw new Error("The server sent an invalid public ephemeral value, aborting...");

  return mod_exp(
    B - k * mod_exp(params.g, x, params.N),
    a + u * x,
    params.N
  );
}

client.derive_K = function(k, x, a, B, u) {
  const S = utils.hex.toBuffer(client.derive_S(k, x, a, B, u));
  return hash(S);
}

client.derive_M1 = function(I, s, A, B, K) {
  const group_hash = buf_xor(
    hash(utils.hex.toBuffer(params.N)),
    hash(utils.hex.toBuffer(params.g))
  );

  return utils.hex.toBigInt(hash(
    group_hash,
    hash(I),
    s, A, B, K
  ));
}

server.derive_B = function(b, v, k) {
  return (k * v + mod_exp(params.g, b, params.N)) % params.N;
}

server.derive_S = function(v, A, b, u) {
  if (mod(A, params.N) === 0n)
    throw new Error("The client sent an invalid public ephemeral value, aborting...");
  return mod_exp(A * mod_exp(v, u, params.N), b, params.N);
}

server.derive_K = function(v, A, b, u) {
  const S = utils.hex.toBuffer(server.derive_S(v, A, b, u));
  return hash(S);
}

server.derive_M2 = function(A, M1, K) {
  return utils.hex.toBigInt(hash(A, M1, K));
}

