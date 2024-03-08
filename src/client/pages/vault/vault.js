import "~/style.css";
import "~/pages/vault/vault.css";
import knoxLogo from "/knox.svg";

import * as keys from "~/scripts/keys.js";
import { hex } from "@/utils.js";
import { PDFDocument } from "pdf-lib";
import axios from "axios";

document.querySelector(".logo").src = knoxLogo;

const session = JSON.parse(sessionStorage.getItem("session"));
sessionStorage.removeItem("session");

const { K, SEK, SAK, identity, device, userID } = {
  K: hex.toBigInt(session?.K || 0n),
  SEK: hex.toBigInt(session?.SEK || 0n),
  SAK: hex.toBigInt(session?.SAK || 0n),
  identity: session?.identity,
  device: session?.deviceID,
  userID: session?.userID,
};

// if (K === 0n) window.location.href = "/login/";
// else console.log(K);

const sk = keys.generate_secret_key(321n);
// downloadSecretKeyPDF(sk);

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
