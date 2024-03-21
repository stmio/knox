import "~/style.css";
import knoxLogo from "/knox.svg";
import loadingIcon from "/loading.svg";

import * as auth from "~/scripts/auth.js";
import { isEmail } from "@/utils.js";

document.querySelector(".logo").src = knoxLogo;
document.querySelector("#loading img").src = loadingIcon;

const user = JSON.parse(localStorage.getItem("user"));

const newUser = document.getElementById("new-user");
const returningUser = document.getElementById("returning-user");
if (user) {
  document.getElementById("user-name").textContent = user.name;
  returningUser.classList.remove("hide");
  newUser.classList.add("hide");
} else {
  returningUser.classList.add("hide");
  newUser.classList.remove("hide");
}

document.getElementById("confirm").addEventListener("click", () => {
  const loading = document.getElementById("loading");
  const msg = document.getElementById("msg");

  const email = user ? user.email : document.getElementById("email").value;
  const sk = user ? user.sk : document.getElementById("key").value;

  const pwd = user
    ? document.getElementById("unlock").value
    : document.getElementById("password").value;

  // TODO: secret key validation and add hyphens??

  if (!email || !pwd || !isEmail(email)) {
    msg.textContent = isEmail(email)
      ? "Missing a required field."
      : "Not a valid email address.";
    return;
  }
  msg.textContent = "";
  loading.style.display = "flex";

  auth
    .login(email, pwd, sk)
    .then((data) => {
      sessionStorage.setItem("session", JSON.stringify(data));
      window.location.href = "/vault/";
    })
    .catch((err) => {
      console.log(err);
      msg.textContent = err.message;
      loading.style.display = "none";
    });

  document.forms["login"].reset();
});

document.getElementById("uncache").addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.reload();
});
