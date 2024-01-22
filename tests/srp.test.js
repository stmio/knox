import { describe, expect, test } from "vitest";
import { core, client, server } from "../src/srp/srp.js";
import { getParams, getTestVectors } from "../src/srp/params.js";

const test_vectors = getTestVectors();
const N = getParams(1024).N;

describe("Core SRP cryptography", () => {
  test("Derive multiplier parameter (k)", () => {
    const k = core.derive_k();
    expect(k).toBe(test_vectors.k);
  });

  test("Derive random scrambling parameter (u)", () => {
    const u = core.derive_u(test_vectors.A, test_vectors.B);
    expect(u).toBe(test_vectors.u);
  });

  test("Derive session key (K)", () => {
    const K = core.derive_K(test_vectors.S);
    expect(K).toBe(test_vectors.K);
  });
});

describe("Client-side SRP cryptography", () => {
  test("Derive private key (x)", () => {
    const x = client.derive_x(test_vectors.I, test_vectors.p, test_vectors.s);
    expect(x).toBe(test_vectors.x);
  });

  test("Derive verifier (v)", () => {
    const v = client.derive_v(test_vectors.x);
    expect(v).toBe(test_vectors.v);
  });

  test("Derive public ephemeral key (A)", () => {
    const A = client.derive_A(test_vectors.a);
    expect(A).toBe(test_vectors.A);
  });

  test("Derive unhashed session key (S)", () => {
    const S = client.derive_S(
      test_vectors.k,
      test_vectors.x,
      test_vectors.a,
      test_vectors.B,
      test_vectors.u
    );

    expect(S).toBe(test_vectors.S);
  });

  test("Abort with invalid server ephemeral (B)", () => {
    expect(() => {
      client.derive_S(
        test_vectors.k,
        test_vectors.x,
        test_vectors.a,
        N * 2n,
        test_vectors.u
      );
    }).toThrowError("abort");

    expect(() => {
      client.derive_S(
        test_vectors.k,
        test_vectors.x,
        test_vectors.a,
        test_vectors.B,
        0n
      );
    }).toThrowError("abort");
  });

  test("Derive auth challenge (M1)", () => {
    const M1 = client.derive_M1(
      test_vectors.I,
      test_vectors.s,
      test_vectors.A,
      test_vectors.B,
      test_vectors.K
    );

    expect(M1).toBe(test_vectors.M1);
  });
});

describe("Server-side SRP cryptography", () => {
  test("Derive public ephemeral key (B)", () => {
    const B = server.derive_B(test_vectors.b, test_vectors.v, test_vectors.k);
    expect(B).toBe(test_vectors.B);
  });

  test("Derive unhashed session key (S)", () => {
    const S = server.derive_S(
      test_vectors.v,
      test_vectors.A,
      test_vectors.b,
      test_vectors.u
    );

    expect(S).toBe(test_vectors.S);
  });

  test("Abort with invalid client ephemeral (A)", () => {
    expect(() => {
      server.derive_S(test_vectors.v, N * 2n, test_vectors.b, test_vectors.u);
    }).toThrowError("abort");
  });

  test("Derive auth challenge (M2)", () => {
    const M2 = server.derive_M2(
      test_vectors.A,
      test_vectors.M1,
      test_vectors.K
    );

    expect(M2).toBe(test_vectors.M2);
  });
});
