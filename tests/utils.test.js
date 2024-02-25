import { describe, expect, test } from "vitest";
import * as utils from "../src/utils.js";

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
