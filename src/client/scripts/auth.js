import axios from "axios";
import { randomBytes } from "crypto";
import { hkdf } from "hkdf";
import { core, client } from "@/srp/srp.js";
import * as keys from "./keys.js";
import { hex } from "@/utils.js";

function generateSalt() {
  return hex.toBigInt(randomBytes(512 / 8));
}

export async function register(email, pwd, secret_key) {
  const auth_salt = generateSalt();
  const enc_salt = generateSalt();
  const uuid = crypto.randomUUID();

  const x = secret_key
    ? await keys.two_sk_derivation(
        pwd,
        secret_key,
        hex.toString(auth_salt),
        email,
        "SRPg-4096",
        uuid
      )
    : client.derive_x(Buffer.from(email), Buffer.from(pwd), auth_salt);
  const v = client.derive_v(x);

  return await axios.post("/auth/register", {
    email: email,
    uuid: uuid,
    srp_v: hex.toString(v),
    srp_s: hex.toString(auth_salt),
    enc_salt: hex.toString(enc_salt),
  });
}

export function login(email, pwd, secret_key) {
  return new Promise((resolve, reject) => {
    const a = core.get_private_ephemeral_key();
    const A = client.derive_A(a);

    axios
      .post("/auth/login", {
        identity: email,
        A: hex.toString(A),
      })
      .then(async (res) => {
        const device = res.data.device;
        const userID = res.data.userID;
        const uuid = res.data.uuid;
        const s = hex.toBigInt(res.data.s);
        const B = hex.toBigInt(res.data.B);
        const u = core.derive_u(A, B);

        const x = secret_key
          ? await keys.two_sk_derivation(
              pwd,
              secret_key,
              hex.toString(s),
              email,
              "SRPg-4096",
              uuid
            )
          : client.derive_x(Buffer.from(email), Buffer.from(pwd), s);

        const K = client.derive_K(core.derive_k(), x, a, B, u);
        const M1 = client.derive_M1(Buffer.from(email), s, A, B, K);

        axios
          .post("/auth/challenge", {
            identity: email,
            deviceID: device,
            challenge: hex.toString(M1),
          })
          .then(async (res) => {
            const M2 = hex.toBigInt(res.data.challenge);
            const enc_salt = res.data.enc_salt;
            const e2e_salt = hex.toBuffer(res.data.e2e_salt);
            const sign_salt = hex.toBuffer(res.data.sign_salt);

            const SEK = Buffer.from(
              await hkdf("sha512", hex.toBuffer(K), e2e_salt, "enc", 32)
            );
            const SAK = Buffer.from(
              await hkdf("sha512", hex.toBuffer(K), sign_salt, "auth", 64)
            );

            const AUK = await keys.toCryptoKey(
              hex.toBuffer(
                await keys.two_sk_derivation(
                  pwd,
                  secret_key,
                  enc_salt,
                  email,
                  "PBES2g-HS512",
                  uuid
                )
              ),
              "AES-GCM",
              false,
              ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
            );

            await keys.storeKey("AUK", AUK);

            localStorage.setItem(
              "user",
              JSON.stringify({
                email: email,
                sk: secret_key,
              })
            );

            client.verify_M2(M2, A, M1, K)
              ? resolve({
                  K: hex.toString(K),
                  SEK: hex.toString(SEK),
                  SAK: hex.toString(SAK),
                  identity: email,
                  deviceID: device,
                  userID: userID,
                })
              : reject(new Error("Server is not trusted. Aborting..."));
          })
          .catch((error) => {
            reject(new Error(error.response?.data.err || error));
          });
      })
      .catch((error) => {
        reject(new Error(error.response?.data.err || error));
      });
  });
}
