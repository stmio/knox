import "~/style.css";
import knoxLogo from "/knox.svg";

import axios from "axios";
import { core, client } from "@/srp/srp.js";
import { hex, isEmail } from "@/utils.js";

document.querySelector(".logo").src = knoxLogo;

document.getElementById("confirm").addEventListener("click", () => {
  const msg = document.getElementById("msg");
  const email = document.getElementById("email").value;
  const pwd = document.getElementById("password").value;

  if (!email || !pwd || !isEmail(email)) {
    msg.textContent = isEmail(email)
      ? "Missing a required field."
      : "Not a valid email address.";
    return;
  }
  msg.textContent = "";

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

          if (!client.verify_M2(M2, A, M1, K)) {
            msg.textContent = "Server is not trusted. Aborting...";
            return;
          }

          sessionStorage.setItem(
            "session",
            JSON.stringify({
              K: hex.toString(K),
              identity: email,
              deviceID: device,
              userID: userID,
            })
          );

          window.location.href = "/vault/";
        })
        .catch((error) => {
          console.log(error);
          msg.textContent = error.response.data.err;
        });
    })
    .catch((error) => {
      console.log(error);
      msg.textContent = error.response.data.err;
    });

  document.forms["login"].reset();
});
