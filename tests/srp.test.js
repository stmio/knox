import { describe, expect, test } from "vitest";
import { core, client, server } from "../src/srp/srp.js";
import * as utils from "../src/utils.js";

// User data that would be stored in the server's database
const test_user = {
  I: Buffer.from("alice"),
  s: utils.hex.toBuffer("BEB25379 D1A8581E B5A72767 3A2441EE"),
};

describe("Core SRP cryptography", () => {
  test("Derive k", () => {
    const actual = core.derive_k();
    const expected =
      utils.hex.toBigInt("7556AA04 5AEF2CDD 07ABAF0F 665C3E81 8913186F");

    expect(actual).toBe(expected);
  });
});

describe("Client-side SRP cryptography", () => {
  const p = Buffer.from("password123");
  const a = utils.hex.toBigInt(
    "60975527 035CF2AD 1989806F 0407210B C81EDC04 E2762A56 AFD529DD DA2D4393"
  );

  test("Derive x", () => {
    const actual = client.derive_x(test_user.I, p, test_user.s);
    const expected =
      utils.hex.toBigInt("94B7555A ABE9127C C58CCF49 93DB6CF8 4D16C124");

    expect(actual).toBe(expected);
  });

  test("Derive verifier (v)", () => {
    const x = client.derive_x(test_user.I, p, test_user.s);
    const actual = client.derive_v(x);
    test_user.v = actual;

    const expected = utils.hex.toBigInt(`
      7E273DE8 696FFC4F 4E337D05 B4B375BE B0DDE156 9E8FA00A 9886D812
      9BADA1F1 822223CA 1A605B53 0E379BA4 729FDC59 F105B478 7E5186F5
      C671085A 1447B52A 48CF1970 B4FB6F84 00BBF4CE BFBB1681 52E08AB5
      EA53D15C 1AFF87B2 B9DA6E04 E058AD51 CC72BFC9 033B564E 26480D78
      E955A5E2 9E7AB245 DB2BE315 E2099AFB
    `);

    expect(actual).toBe(expected);
  });

  test("Derive A", () => {
    const actual = client.derive_A(a);
    const expected = utils.hex.toBigInt(`
      61D5E490 F6F1B795 47B0704C 436F523D D0E560F0 C64115BB 72557EC4
      4352E890 3211C046 92272D8B 2D1A5358 A2CF1B6E 0BFCF99F 921530EC
      8E393561 79EAE45E 42BA92AE ACED8251 71E1E8B9 AF6D9C03 E1327F44
      BE087EF0 6530E69F 66615261 EEF54073 CA11CF58 58F0EDFD FE15EFEA
      B349EF5D 76988A36 72FAC47B 0769447B
    `);

    expect(actual).toBe(expected);
  });
});

describe("Server-side SRP cryptography", () => {
  const b = utils.hex.toBigInt(
    "E487CB59 D31AC550 471E81F0 0F6928E0 1DDA08E9 74A004F4 9E61F5D1 05284D20"
  );

  test("Derive B", () => {
    const actual = server.derive_B(b, test_user.v, core.derive_k());
    const expected = utils.hex.toBigInt(`
      BD0C6151 2C692C0C B6D041FA 01BB152D 4916A1E7 7AF46AE1 05393011
      BAF38964 DC46A067 0DD125B9 5A981652 236F99D9 B681CBF8 7837EC99
      6C6DA044 53728610 D0C6DDB5 8B318885 D7D82C7F 8DEB75CE 7BD4FBAA
      37089E6F 9C6059F3 88838E7A 00030B33 1EB76840 910440B1 B27AAEAE
      EB4012B7 D7665238 A8E3FB00 4B117B58
    `);

    expect(actual).toBe(expected);
  });
});

