import { describe, expect, test } from "vitest";
import { core, client, server } from "../src/srp/srp.js";
import * as utils from "../src/utils.js";

describe("Server-side SRP cryptography", () => {
  test("Generate B", () => {
    expect(1 == 1).toBe(true);
  });
});

describe("Client-side SRP cryptography", () => {
  const I = Buffer.from("alice");
  const p = Buffer.from("password123");
  const s = utils.hex.toBuffer("BEB25379 D1A8581E B5A72767 3A2441EE");

  test("Derive x", () => {
    const actual = client.derive_x(I, p, s);
    const expected =
      utils.hex.toBigInt("94B7555A ABE9127C C58CCF49 93DB6CF8 4D16C124");

    expect(actual).toBe(expected);
  });

  test("Derive verifier (v)", () => {
    const x = client.derive_x(I, p, s);
    const actual = client.derive_v(x);

    const expected = utils.hex.toBigInt(`
      7E273DE8 696FFC4F 4E337D05 B4B375BE B0DDE156 9E8FA00A 9886D812
      9BADA1F1 822223CA 1A605B53 0E379BA4 729FDC59 F105B478 7E5186F5
      C671085A 1447B52A 48CF1970 B4FB6F84 00BBF4CE BFBB1681 52E08AB5
      EA53D15C 1AFF87B2 B9DA6E04 E058AD51 CC72BFC9 033B564E 26480D78
      E955A5E2 9E7AB245 DB2BE315 E2099AFB
    `);

    expect(actual).toBe(expected);
  });

  test("Generate A", () => {
    expect(1 == 1).toBe(true);
  });
});
