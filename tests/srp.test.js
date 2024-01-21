import { describe, expect, test } from "vitest";
import { core, client, server } from "../src/srp/srp.js";
import { getParams } from "../src/srp/params.js";
import * as utils from "../src/utils.js";

// User data that would be stored in the server's database
const test_user = {
  I: Buffer.from("alice"),
  s: utils.hex.toBuffer("BEB25379 D1A8581E B5A72767 3A2441EE"),
};

const session = {
  A: utils.hex.toBigInt(`
    61D5E490 F6F1B795 47B0704C 436F523D D0E560F0 C64115BB 72557EC4
    4352E890 3211C046 92272D8B 2D1A5358 A2CF1B6E 0BFCF99F 921530EC
    8E393561 79EAE45E 42BA92AE ACED8251 71E1E8B9 AF6D9C03 E1327F44
    BE087EF0 6530E69F 66615261 EEF54073 CA11CF58 58F0EDFD FE15EFEA
    B349EF5D 76988A36 72FAC47B 0769447B
  `),
  B: utils.hex.toBigInt(`
    BD0C6151 2C692C0C B6D041FA 01BB152D 4916A1E7 7AF46AE1 05393011
    BAF38964 DC46A067 0DD125B9 5A981652 236F99D9 B681CBF8 7837EC99
    6C6DA044 53728610 D0C6DDB5 8B318885 D7D82C7F 8DEB75CE 7BD4FBAA
    37089E6F 9C6059F3 88838E7A 00030B33 1EB76840 910440B1 B27AAEAE
    EB4012B7 D7665238 A8E3FB00 4B117B58
  `),
  S: utils.hex.toBigInt(`
    B0DC82BA BCF30674 AE450C02 87745E79 90A3381F 63B387AA F271A10D
    233861E3 59B48220 F7C4693C 9AE12B0A 6F67809F 0876E2D0 13800D6C
    41BB59B6 D5979B5C 00A172B4 A2A5903A 0BDCAF8A 709585EB 2AFAFA8F
    3499B200 210DCC1F 10EB3394 3CD67FC8 8A2F39A4 BE5BEC4E C0A3212D
    C346D7E4 74B29EDE 8A469FFE CA686E5A
  `),
};

describe("Core SRP cryptography", () => {
  test("Derive k", () => {
    const actual = core.derive_k();
    const expected =
      utils.hex.toBigInt("7556AA04 5AEF2CDD 07ABAF0F 665C3E81 8913186F");

    expect(actual).toBe(expected);
  });

  test("Derive u", () => {
    const actual = core.derive_u(session.A, session.B);
    const expected =
      utils.hex.toBigInt("CE38B959 3487DA98 554ED47D 70A7AE5F 462EF019");

    expect(actual).toBe(expected);
  });

  test("Derive K (session key)", () => {
    const actual = utils.hex.toBigInt(core.derive_K(session.S));
    const expected =
      utils.hex.toBigInt("017EEFA1 CEFC5C2E 626E2159 8987F31E 0F1B11BB");

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

  test("Derive v (verifier)", () => {
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
    expect(client.derive_A(a)).toBe(session.A);
  });

  test("Derive S", () => {
    const S = client.derive_S(
      core.derive_k(),
      client.derive_x(test_user.I, p, test_user.s),
      a,
      session.B,
      core.derive_u(session.A, session.B)
    );

    expect(S).toBe(session.S);
  });

  test("Abort with invalid server ephemeral", () => {
    expect(() => {
      client.derive_S(
        core.derive_k(),
        client.derive_x(test_user.I, p, test_user.s),
        a,
        getParams(1024).N * 2n,
        core.derive_u(session.A, session.B)
      );
    }).toThrowError("abort");

    expect(() => {
      client.derive_S(
        core.derive_k(),
        client.derive_x(test_user.I, p, test_user.s),
        a,
        session.B,
        0n
      );
    }).toThrowError("abort");
  });

  test("Derive M1", () => {
    const actual = client.derive_M1(
      test_user.I, test_user.s,
      utils.hex.toBuffer(session.A),
      utils.hex.toBuffer(session.B),
      core.derive_K(session.S)
    );
    const expected =
      utils.hex.toBigInt("3F3BC671 69EA7130 2599CF1B 0F5D408B 7B65D347");

    session.M1 = actual;
    expect(actual).toBe(expected);
  });
});

describe("Server-side SRP cryptography", () => {
  const b = utils.hex.toBigInt(
    "E487CB59 D31AC550 471E81F0 0F6928E0 1DDA08E9 74A004F4 9E61F5D1 05284D20"
  );

  test("Derive B", () => {
    expect(
      server.derive_B(b, test_user.v, core.derive_k())
    ).toBe(session.B);
  });


  test("Derive S", () => {
    const S = server.derive_S(
      test_user.v,
      session.A,
      b,
      core.derive_u(session.A, session.B)
    );

    expect(S).toBe(session.S);
  });

  test("Abort with invalid client ephemeral", () => {
    expect(() => {
      server.derive_S(
        test_user.v,
        getParams(1024).N * 2n,
        b,
        core.derive_u(session.A, session.B)
      );
    }).toThrowError("abort");
  });

  test("Derive M2", () => {
    const actual = server.derive_M2(
      utils.hex.toBuffer(session.A),
      utils.hex.toBuffer(session.M1),
      utils.hex.toBuffer(core.derive_K(session.S))
    );
    const expected =
      utils.hex.toBigInt("9CAB3C57 5A11DE37 D3AC1421 A9F00923 6A48EB55");

    expect(actual).toBe(expected);
  });
});

