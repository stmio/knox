import "~/style.css";
import knoxLogo from "/knox.svg";
import * as auth from "~/scripts/auth.js";
import { isEmail } from "@/utils.js";

document.querySelector(".logo").src = knoxLogo;

document.getElementById("confirm").addEventListener("click", () => {
  const msg = document.getElementById("msg");
  const email = document.getElementById("email").value;
  const pwd = document.getElementById("password").value;
  const sk = document.getElementById("key").value;

  // TODO: secret key validation and add hyphens??

  if (!email || !pwd || !isEmail(email)) {
    msg.textContent = isEmail(email)
      ? "Missing a required field."
      : "Not a valid email address.";
    return;
  }
  msg.textContent = "";

  auth
    .login(email, pwd, sk)
    .then((data) => {
      sessionStorage.setItem("session", JSON.stringify(data));
      window.location.href = "/vault/";
    })
    .catch((err) => {
      console.log(err);
      msg.textContent = err.message;
    });

  document.forms["login"].reset();
});
