import { describe, expect, test } from "vitest";
import * as utils from "../src/utils.js";

describe("Hexadecimal utilities", () => {
  test("Parse hex string", () => {
    const test_hex = {
      ab20c: "0x0ab20c",
      a9c80f: "0xa9c80f",
      "80b375": "0x80b375",
      "799c7b": "0x799c7b",
      "5e78a3": "0x5e78a3",
      "7845c08": "0x07845c08",
      e3951b: "0xe3951b",
      f41ec2f: "0x0f41ec2f",
    };

    for (const hex in test_hex) {
      expect(utils.hex.parseString(hex)).toBe(test_hex[hex]);
    }
  });
});

describe("Validation utilities", () => {
  test("Validate email addresses", () => {
    const test_emails = {
      "samturner@mail.com": true,
      "dave@mail.london": true,
      "21mail.uk": false,
      "": false,
      "@google.com": false,
      "derek@": false,
      "myemail@outlook.com": true,
    };

    for (const email in test_emails) {
      expect(utils.isEmail(email)).toBe(test_emails[email]);
    }
  });
});
