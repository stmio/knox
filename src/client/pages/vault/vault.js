import "~/style.css";
import "~/pages/vault/vault.css";
import knoxLogo from "/knox.svg";

import { api } from "~/scripts/middleware.js";
import {
  getUserSession,
  loadKeychain,
  getKey,
  loadVault,
} from "~/scripts/keys.js";

document.querySelector(".logo").src = knoxLogo;
window.addEventListener("hashchange", (x) => setWindow(x.newURL));
setWindow(window.location.href);

const session = getUserSession();

document.addEventListener("DOMContentLoaded", async () => {
  if (!session) {
    window.location.href = "/login/";
    return;
  }

  await checkUserStatus();
  const AUK = await getKey("AUK");
  const keychainIDs = await getUserKeychainUUIDs();

  const keychainData = await getKeychain(keychainIDs[0]);
  const keychain = await loadKeychain(keychainData.keys, AUK);

  const vaultData = await getVault(keychainData.vault);
  const vault = await loadVault(keychain.vek, vaultData);

  vault.forEach((item) => listItem(item));
  console.log(session);

  // Open new item menu
  document.getElementById("new").addEventListener("click", () => {
    window.location.hash = "#new";
  });

  // Create new item
  document.getElementById("create").addEventListener("click", () => {
    const name = document.getElementById("new-name").value;
    const email = document.getElementById("new-email").value;
    const pwd = document.getElementById("new-password").value;
    const url = document.getElementById("new-url").value;

    const item = {
      name: name,
      url: url,
      email: email,
      pwd: pwd,
    };

    listItem(item);
    vault.push(item);
    console.log(vault);
    document.forms["new"].reset();
    window.location.hash = "#";
  });
});

function listItem(item) {
  const template = document.getElementById("item-template");
  const elem = template.content.querySelector(".item").cloneNode(true);
  const sidebar = document.getElementById("sidebar");
  sidebar.appendChild(elem);

  elem.querySelector(".name").textContent = item.name;
  elem.querySelector(".icon").src = `${item.url}/favicon.ico`;

  elem.addEventListener("click", (x) => {
    const items = document.querySelectorAll(".item");
    items.forEach((i) => (i.style.textDecoration = "inherit"));
    elem.style.textDecoration = "underline wavy blue";

    document.getElementById("info").style.display = "flex";
    document.getElementById("url").href = item.url;
    document.getElementById("url").textContent = item.url;
    document.getElementById("email").textContent = item.email;
    document.getElementById("pwd").textContent = item.pwd;
  });
}

function checkUserStatus() {
  return api
    .post("/auth/status", { email: session.identity, deviceID: session.device })
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
}

function getUserKeychainUUIDs() {
  return api
    .post("/users/keychains", {
      email: session.identity,
      deviceID: session.device,
    })
    .then((keychains) => JSON.parse(keychains.data))
    .catch((err) => err);
}

function getKeychain(uuid) {
  return api
    .post("/keychains/get", {
      email: session.identity,
      deviceID: session.device,
      keychainUuid: uuid,
    })
    .then((keychain) => JSON.parse(keychain.data))
    .catch((err) => err);
}

function getVault(uuid) {
  return api
    .post("/vaults/get", {
      email: session.identity,
      deviceID: session.device,
      vaultUuid: uuid,
    })
    .then((vault) => JSON.parse(vault.data))
    .catch((err) => err);
}

function setWindow(URL) {
  const window = document.getElementById("window");
  const settings = document.getElementById("settings");
  const newItem = document.getElementById("new-item");

  if (URL.endsWith("#settings")) {
    window.style.display = "flex";
    settings.classList.remove("hide");
    newItem.classList.add("hide");
  } else if (URL.endsWith("#new")) {
    window.style.display = "flex";
    settings.classList.add("hide");
    newItem.classList.remove("hide");
  } else {
    window.style.display = "none";
  }
}
