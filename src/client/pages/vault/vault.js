import "~/style.css";
import "~/pages/vault/vault.css";
import knoxLogo from "/knox.svg";

import { api } from "~/scripts/middleware.js";
import { getUserSession } from "~/scripts/keys.js";

document.querySelector(".logo").src = knoxLogo;

const session = getUserSession();

// if (!session) window.location.href = "/login/";
// else {
// await api
//   .post("/auth/status", { email: session.identity, deviceID: session.device })
//   .then((res) => console.log(res))
//   .catch((err) => console.log(err));

window.addEventListener("hashchange", (x) => setWindow(x.newURL));
setWindow(window.location.href);

const item = document.querySelector(".item");
for (let i = 0; i < 20; i++)
  item.parentElement.appendChild(item.cloneNode(true));

const items = document.querySelectorAll(".item");
items.forEach((i) =>
  i.addEventListener("click", (x) => {
    items.forEach((i) => (i.style.textDecoration = "inherit"));
    i.style.textDecoration = "underline wavy blue";
  })
);
// }

function setWindow(URL) {
  const settings = document.getElementById("window");
  if (URL.endsWith("#settings")) settings.style.display = "flex";
  else settings.style.display = "none";
}
