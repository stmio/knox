import "~/style.css";
import "~/pages/vault/vault.css";
import knoxLogo from "/knox.svg";

import { api } from "~/scripts/middleware.js";
import { isEmail, isUrl } from "@/utils.js";
import {
  getUserSession,
  loadKeychain,
  getKey,
  loadVault,
  encryptVault,
} from "~/scripts/keys.js";

document.querySelector(".logo").src = knoxLogo;
window.addEventListener("hashchange", (x) => setWindow(x.newURL));
setWindow(window.location.href);

const session = getUserSession();
let vault;
let selectedItem;

document.addEventListener("DOMContentLoaded", async () => {
  if (!session) {
    window.location.href = "/login/";
    return;
  } else {
    const user = JSON.parse(localStorage.getItem("user"));

    localStorage.setItem(
      "user",
      JSON.stringify({ ...user, name: await getUserName() })
    );
  }

  await checkUserStatus();
  const AUK = await getKey("AUK");
  const keychainIDs = await getUserKeychainUUIDs();

  const keychainData = await getKeychain(keychainIDs[0]);
  const keychain = await loadKeychain(keychainData.keys, AUK);

  const vaultData = await getVault(keychainData.vault);
  const vaultUuid = vaultData.uuid;
  vault = await loadVault(keychain.vek, vaultData);

  vault.forEach((item) => listItem(item));

  // Open new item menu
  document.getElementById("new").addEventListener("click", () => {
    window.location.hash = "#new";
  });

  // Create new item
  document.getElementById("create").addEventListener("click", async () => {
    const msg = document.getElementById("msg");
    msg.textContent = "";

    const name = document.getElementById("new-name").value;
    const email = document.getElementById("new-email").value;
    const pwd = document.getElementById("new-password").value;
    let url = document.getElementById("new-url").value;

    // Check all values are provided
    if (!name || !email || !pwd || !url) {
      msg.textContent = "A field is missing a value";
      return;
    }

    // Check email address validity
    if (!isEmail(email)) {
      msg.textContent = "The provided email is not a valid address";
      return;
    }

    // Validate and parse website URL
    if (!url.startsWith("https://") && !url.startsWith("http://")) {
      url = "https://" + url;
    }
    if (!isUrl(url)) {
      msg.textContent = "The provided site URL is invalid";
      return;
    }

    // Check for duplicates
    for (const i in vault) {
      if (vault[i].name === name) {
        msg.textContent = "Already an item with this name";
        return;
      }
    }

    const item = {
      name: name,
      url: url,
      email: email,
      pwd: pwd,
    };

    listItem(item);
    vault.push(item);

    document.forms["new"].reset();
    window.location.hash = "#";

    const encVault = await encryptVault(keychain.vek, vault, vaultUuid);
    await submitVault(encVault);
  });

  const pwdInput = document.getElementById("pwd");
  const showButton = document.getElementById("show-pwd");
  showButton.addEventListener("click", () => {
    pwdInput.type = pwdInput.type === "password" ? "text" : "password";
    showButton.textContent =
      showButton.textContent === "Show" ? "Hide" : "Show";
  });
  const copyButton = document.getElementById("copy-pwd");
  copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(pwdInput.value);
    copyButton.textContent = "Copied!";
    setTimeout(() => (copyButton.textContent = "Copy"), 1000);
  });

  const updateButton = document.getElementById("update-item");
  updateButton.addEventListener("click", async () => {
    vault = vault.filter((item) => item !== selectedItem);

    const url = document.getElementById("url").value;
    const email = document.getElementById("email").value;
    const pwd = document.getElementById("pwd").value;

    const item = {
      name: selectedItem.name,
      url: url,
      email: email,
      pwd: pwd,
    };

    vault.push(item);
    selectedItem = item;

    document.querySelector(`.knox-item-${item.name}`).remove();
    listItem(item, true);

    const encVault = await encryptVault(keychain.vek, vault, vaultUuid);
    await submitVault(encVault);

    updateButton.style.color = "limegreen";
    setTimeout(() => (updateButton.style.color = "inherit"), 1000);
  });

  const deleteButton = document.getElementById("delete-item");
  deleteButton.addEventListener("click", async () => {
    document.querySelector(`.knox-item-${selectedItem.name}`).remove();
    for (const i in vault) {
      if (vault[i].name === selectedItem.name) {
        vault.splice(i, 1);
      }
    }

    const encVault = await encryptVault(keychain.vek, vault, vaultUuid);
    await submitVault(encVault);
  });

  document.getElementById("export").addEventListener("click", () => {
    const jsonVault = JSON.stringify(vault);

    const blob = new Blob([jsonVault], { type: "application/json" });
    const jsonObject = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = jsonObject;
    link.download = "knox.json";
    link.click();

    URL.revokeObjectURL(jsonObject);
  });
});

function listItem(item, selected = false) {
  const template = document.getElementById("item-template");
  const elem = template.content.querySelector(".item").cloneNode(true);
  const sidebar = document.getElementById("sidebar");
  sidebar.appendChild(elem);

  elem.querySelector(".name").textContent = item.name;
  elem.querySelector(".icon").src = `${item.url}/favicon.ico`;
  elem.classList.add(`knox-item-${item.name}`);

  elem.addEventListener("click", (x) => {
    const items = document.querySelectorAll(".item");
    items.forEach((i) => (i.style.textDecoration = "inherit"));
    elem.style.textDecoration = "underline solid #3c3ce2";

    selectedItem = item;

    document.getElementById("info").style.display = "flex";
    document.getElementById("url-link").href = item.url;
    document.getElementById("url").value = item.url;
    document.getElementById("email").value = item.email;
    document.getElementById("pwd").value = item.pwd;
  });

  if (selected) elem.style.textDecoration = "underline solid #3c3ce2";
}

function checkUserStatus() {
  return api
    .post("/auth/status", { email: session.identity, deviceID: session.device })
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
}

function getUserName() {
  return api
    .post("/users/name", {
      email: session.identity,
      deviceID: session.device,
    })
    .then((res) => res.data)
    .catch((err) => err);
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

function submitVault(vault) {
  return api
    .post("/vaults/update", {
      email: session.identity,
      deviceID: session.device,
      data: JSON.stringify(vault.data),
      iv: JSON.stringify(vault.iv),
      vaultUuid: vault.uuid,
    })
    .then((res) => res)
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
