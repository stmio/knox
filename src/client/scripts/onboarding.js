import { api } from "./middleware.js";
import axios from "axios";
import { PDFDocument } from "pdf-lib";

import {
  getUserSession,
  display_secret_key,
  generateKeychain,
  setupVault,
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
      document.getElementById("key").textContent = sk;
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
    const vault = await setupVault(keychain, AUK, [identity, pwd]);

    console.log(vault);
    // setTimeout(() => (window.location.href = "/vault/"), 1000);
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
