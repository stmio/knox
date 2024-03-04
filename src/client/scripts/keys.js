import { randomBytes } from "crypto";

export function generate_secret_key(acc_id) {
  const account_id = acc_id.toString(16).padStart(6, "0").toUpperCase();

  const secret = randomBytes(16)
    .toString("hex")
    .match(new RegExp(".{1,4}", "g"))
    .join("-")
    .toUpperCase();

  return `${account_id}-${secret}`;
}
