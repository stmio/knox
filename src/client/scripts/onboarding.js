import { api } from "./middleware.js";
import axios from "axios";
import { PDFDocument } from "pdf-lib";

import {
  getUserSession,
  display_secret_key,
  generateKeychain,
  generateVault,
  getKey,
} from "./keys.js";

const onboardWindow = document.getElementById("window");
const namesMenu = document.getElementById("names");
const skMenu = document.getElementById("secret-key");
const generateMenu = document.getElementById("generate-keys");

export async function onboardUser(identity, pwd, secret_key) {
  const session = getUserSession();
  onboardWindow.style.display = "flex";

  document
    .getElementById("names-submit")
    .addEventListener("click", async () => {
      const firstname = document.getElementById("f-name").value;
      const surname = document.getElementById("surname").value;

      await submitName(identity, session.device, firstname, surname);
      namesMenu.classList.add("hide");
      skMenu.classList.remove("hide");

      const sk = display_secret_key(session.userID, secret_key);
      document.getElementById("key-display").textContent = sk;
      await downloadSecretKeyPDF(sk);
    });

  document.getElementById("sk-submit").addEventListener("click", () => {
    skMenu.classList.add("hide");
    generateMenu.classList.remove("hide");
  });

  document.getElementById("submit").addEventListener("click", async () => {
    document.getElementById("loading").style.display = "flex";

    const AUK = await getKey("AUK");
    const keychain = await generateKeychain(AUK);
    const vault = await generateVault(keychain, AUK, identity, pwd);

    await submitVault(
      identity,
      session.device,
      vault.uuid,
      JSON.stringify(vault.data),
      JSON.stringify(vault.iv)
    );

    await submitKeychain(
      identity,
      session.device,
      keychain.uuid,
      vault.uuid,
      JSON.stringify(keychain)
    );

    setTimeout(() => (window.location.href = "/vault/"), 500);
  });
}

function submitName(identity, deviceID, firstname, surname) {
  return api.put("/users/name", {
    email: identity,
    deviceID: deviceID,
    forename: firstname,
    surname: surname,
  });
}

function submitVault(identity, deviceID, vaultUuid, data, iv) {
  return api.post("/vaults/store", {
    email: identity,
    deviceID: deviceID,
    vaultUuid: vaultUuid,
    iv: iv,
    data: data,
  });
}

function submitKeychain(identity, deviceID, keychainUuid, vaultUuid, data) {
  return api.post("/keychains/store", {
    email: identity,
    deviceID: deviceID,
    keychainUuid: keychainUuid,
    vaultUuid: vaultUuid,
    data: data,
  });
}

async function downloadSecretKeyPDF(key) {
  const pdf = await PDFDocument.load(
    await axios
      .get("/template.pdf", { responseType: "arraybuffer" })
      .then((res) => res.data)
      .catch((err) => console.log(err))
  );

  const pages = pdf.getPages();
  pages[0].drawText("Secret Key:\n" + key, {
    x: 57,
    y: 700,
    size: 12,
  });

  const pdfBytes = await pdf.save();
  const file = new Blob([pdfBytes], { type: "application/pdf" });
  const fileURL = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = fileURL;
  link.download = "Knox - Security Information Document";
  link.click();
}
