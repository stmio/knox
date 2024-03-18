import "~/style.css";
import knoxLogo from "/knox.svg";
import loadingIcon from "/loading.svg";
import * as auth from "~/scripts/auth.js";
import { generate_secret_key } from "~/scripts/keys.js";
import { onboardUser } from "~/scripts/onboarding.js";
import { isEmail, validatePassword } from "@/utils.js";

document.querySelector(".logo").src = knoxLogo;
document.querySelector("#loading img").src = loadingIcon;

document.getElementById("confirm").addEventListener("click", () => {
  const msg = document.getElementById("msg");
  const loading = document.getElementById("loading");

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

  loading.style.display = "flex";

  const secret_key = generate_secret_key();

  auth
    .register(email, pwd, secret_key)
    .then((res) => {
      auth
        .login(email, pwd, secret_key)
        .then(async (data) => {
          sessionStorage.setItem("session", JSON.stringify(data));
          loading.style.display = "none";

          try {
            await onboardUser(email, pwd, secret_key);
          } catch (err) {
            console.log(err);
          }
        })
        .catch((err) => {
          console.log(err);
          loading.style.display = "none";
          msg.textContent = err.message;
        });
    })
    .catch((res) => {
      console.log(res);
      loading.style.display = "none";
      msg.textContent = res.response.data.err;
    });

  document.forms["register"].reset();
});
