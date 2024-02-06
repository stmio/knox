import "~/style.css";
import knoxLogo from "/knox.svg";

import axios from "axios";
import { randomBytes } from "crypto";
import { client } from "@/srp/srp.js";
import { hex, isEmail } from "@/utils.js";

document.querySelector(".logo").src = knoxLogo;

document.getElementById("confirm").addEventListener("click", () => {
  const msg = document.getElementById("msg");
  const email = document.getElementById("email").value;
  const pwd = document.getElementById("password").value;
  const s = hex.toBigInt(randomBytes(512 / 8));

  if (!email || !pwd || !isEmail(email)) {
    msg.textContent = isEmail(email)
      ? "Missing a required field."
      : "Not a valid email address.";
    return;
  }

  msg.textContent = "";

  axios
    .post("/auth/register", {
      email: email,
      srp_v: client
        .derive_v(client.derive_x(Buffer.from(email), Buffer.from(pwd), s))
        .toString(16),
      srp_s: s.toString(16),
    })
    .then((res) => (window.location.href = "/"))
    .catch((res) => (msg.textContent = res.response.data.err));

  document.forms["register"].reset();
});
