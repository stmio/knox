import * as crypto from "crypto";
import { getParams } from "./params.js";
import { hex } from "../utils.js";

export const core = {};
export const client = {};
export const server = {};

// Use 1024-bit group if testing, use 4096-bit group otherwise
const group = process.env.NODE_ENV === "test" ? 1024 : 4096;
const params = getParams(group);

// Hashes an arbitrary number of buffers
function hash(...args) {
  const H = crypto.createHash(params.hash);
  args.forEach((arg) => H.update(arg));
  return H.digest();
}

// Left-pads buffer until its length matches N
function pad(n) {
  const len = hex.toBuffer(params.N).length;
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

// Modular exponentiation for BigInts: a^x (mod N)
function mod_exp(a, x, N) {
  if (N === 1n) return 0n;
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

core.derive_k = function () {
  return hex.toBigInt(
    hash(hex.toBuffer(params.N), pad(hex.toBuffer(params.g)))
  );
};

// Used for generating the random values of the private keys a, b.
core.get_private_ephemeral_key = function (bitLength = 512) {
  if (bitLength < 256)
    throw new Error(
      "Must have a bit length of at least the recommended 256-bits."
    );
  return hex.toBigInt(crypto.randomBytes(bitLength / 8));
};

core.derive_u = function (A, B) {
  const u = hash(pad(hex.toBuffer(A)), pad(hex.toBuffer(B)));
  return hex.toBigInt(u);
};

core.derive_K = function (S) {
  const K = hash(hex.toBuffer(S));
  return hex.toBigInt(K);
};

client.derive_x = function (I, p, s) {
  const salt = hex.toBuffer(s);
  const user_hash = hash(Buffer.concat([I, Buffer.from(":"), p]));
  return hex.toBigInt(hash(salt, user_hash));
};

client.derive_v = function (x) {
  return mod_exp(params.g, x, params.N);
};

client.derive_A = function (a) {
  return mod_exp(params.g, a, params.N);
};

client.derive_S = function (k, x, a, B, u) {
  if (mod(B, params.N) === 0n || u === 0n)
    throw new Error(
      "The server sent an invalid public ephemeral value, aborting..."
    );

  return mod_exp(B - k * mod_exp(params.g, x, params.N), a + u * x, params.N);
};

client.derive_K = function (k, x, a, B, u) {
  const S = hex.toBuffer(client.derive_S(k, x, a, B, u));
  return hex.toBigInt(hash(S));
};

client.derive_M1 = function (I, s, A, B, K) {
  const group_hash = buf_xor(
    hash(hex.toBuffer(params.N)),
    hash(hex.toBuffer(params.g))
  );

  return hex.toBigInt(
    hash(
      group_hash,
      hash(I),
      hex.toBuffer(s),
      hex.toBuffer(A),
      hex.toBuffer(B),
      hex.toBuffer(K)
    )
  );
};

client.verify_M2 = function (server_M2, A, M1, K) {
  const M2 = hex.toBigInt(
    hash(hex.toBuffer(A), hex.toBuffer(M1), hex.toBuffer(K))
  );
  return M2 === server_M2;
};

server.derive_B = function (b, v, k) {
  return (k * v + mod_exp(params.g, b, params.N)) % params.N;
};

server.derive_S = function (v, A, b, u) {
  if (mod(A, params.N) === 0n)
    throw new Error(
      "The client sent an invalid public ephemeral value, aborting..."
    );
  return mod_exp(A * mod_exp(v, u, params.N), b, params.N);
};

server.derive_K = function (v, A, b, u) {
  const S = hex.toBuffer(server.derive_S(v, A, b, u));
  return hex.toBigInt(hash(S));
};

server.derive_M2 = function (A, M1, K) {
  return hex.toBigInt(hash(hex.toBuffer(A), hex.toBuffer(M1), hex.toBuffer(K)));
};

server.verify_M1 = function (client_M1, I, s, A, B, K) {
  const group_hash = buf_xor(
    hash(hex.toBuffer(params.N)),
    hash(hex.toBuffer(params.g))
  );

  const M1 = hex.toBigInt(
    hash(
      group_hash,
      hash(I),
      hex.toBuffer(s),
      hex.toBuffer(A),
      hex.toBuffer(B),
      hex.toBuffer(K)
    )
  );

  return M1 === client_M1;
};
