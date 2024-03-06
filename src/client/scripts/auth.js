import axios from "axios";
import { randomBytes } from "crypto";
import { core, client } from "@/srp/srp.js";
import { hex } from "@/utils.js";

function generateSalt() {
  return hex.toBigInt(randomBytes(512 / 8));
}

export async function register(email, pwd) {
  const s = generateSalt();
  const x = client.derive_x(Buffer.from(email), Buffer.from(pwd), s);
  const v = client.derive_v(x);

  return await axios.post("/auth/register", {
    email: email,
    srp_v: hex.toString(v),
    srp_s: hex.toString(s),
  });
}

export function login(email, pwd) {
  return new Promise((resolve, reject) => {
    const a = core.get_private_ephemeral_key();
    const A = client.derive_A(a);

    axios
      .post("/auth/login", {
        identity: email,
        A: hex.toString(A),
      })
      .then((res) => {
        const device = res.data.device;
        const userID = res.data.userID;
        const s = hex.toBigInt(res.data.s);
        const B = hex.toBigInt(res.data.B);
        const u = core.derive_u(A, B);

        // TODO: abort if safeguards fail
        // TODO: change buffer.from to hex

        const x = client.derive_x(Buffer.from(email), Buffer.from(pwd), s);
        const K = client.derive_K(core.derive_k(), x, a, B, u);
        const M1 = client.derive_M1(Buffer.from(email), s, A, B, K);

        axios
          .post("/auth/challenge", {
            identity: email,
            deviceID: device,
            challenge: hex.toString(M1),
          })
          .then((res) => {
            const M2 = hex.toBigInt(res.data.challenge);

            client.verify_M2(M2, A, M1, K)
              ? resolve({
                  K: hex.toString(K),
                  identity: email,
                  deviceID: device,
                  userID: userID,
                })
              : reject(new Error("Server is not trusted. Aborting..."));
          })
          .catch((error) => {
            reject(new Error(error.response.data.err));
          });
      })
      .catch((error) => {
        reject(new Error(error.response.data.err));
      });
  });
}
