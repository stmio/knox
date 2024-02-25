import "~/style.css";
import "~/pages/vault/vault.css";
import knoxLogo from "/knox.svg";
import { hex } from "@/utils.js";
import axios from "axios";

document.querySelector(".logo").src = knoxLogo;

const session = JSON.parse(sessionStorage.getItem("session"));
sessionStorage.removeItem("session");

const { K, identity, device, userID } = {
  K: hex.toBigInt(session?.K || 0n),
  identity: session?.identity,
  device: session?.deviceID,
  userID: session?.userID,
};

console.log(userID);

// if (K === 0n) window.location.href = "/login/";
// else console.log(K);

function setWindow(URL) {
  const settings = document.getElementById("settings");
  if (URL.endsWith("#settings")) settings.style.display = "flex";
  else settings.style.display = "none";
}

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
