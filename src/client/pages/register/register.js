import "~/style.css";
import knoxLogo from "/knox.svg";
import * as auth from "~/scripts/auth.js";
import { generate_secret_key } from "~/scripts/keys.js";
import { isEmail, validatePassword } from "@/utils.js";

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

  const validPassword = validatePassword(pwd);
  if (!validPassword.status) {
    msg.textContent = validPassword.msg;
    return;
  }

  const secret_key = generate_secret_key();
  console.log(secret_key);

  auth
    .register(email, pwd, secret_key)
    .then((res) => {
      auth
        .login(email, pwd, secret_key)
        .then((data) => {
          sessionStorage.setItem("session", JSON.stringify(data));
          window.location.href = "/vault/";
        })
        .catch((err) => {
          console.log(err);
          msg.textContent = err.message;
        });
    })
    .catch((res) => (msg.textContent = res.response.data.err));

  document.forms["register"].reset();
});
