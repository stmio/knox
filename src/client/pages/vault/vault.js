import "~/style.css";
import "~/pages/vault/vault.css";
import knoxLogo from "/knox.svg";

import { api } from "~/scripts/middleware.js";
import { getUserSession } from "~/scripts/keys.js";
// import { PDFDocument } from "pdf-lib";

document.querySelector(".logo").src = knoxLogo;

const session = getUserSession();

if (!session) window.location.href = "/login/";
else {
  await api
    .post("/auth/status", { email: session.identity, deviceID: session.device })
    .then((res) => console.log(res))
    .catch((err) => console.log(err));

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
}

// async function downloadSecretKeyPDF(key) {
//   const pdf = await PDFDocument.load(
//     await axios
//       .get("/template.pdf", { responseType: "arraybuffer" })
//       .then((res) => res.data)
//       .catch((err) => console.log(err))
//   );

//   const pages = pdf.getPages();
//   pages[0].drawText("Secret Key:\n" + key, {
//     x: 57,
//     y: 700,
//     size: 12,
//   });

//   const pdfBytes = await pdf.save();
//   const file = new Blob([pdfBytes], { type: "application/pdf" });
//   const fileURL = URL.createObjectURL(file);
//   const link = document.createElement("a");
//   link.href = fileURL;
//   link.download = "Knox - Security Information Document";
//   link.click();
// }

function setWindow(URL) {
  const settings = document.getElementById("window");
  if (URL.endsWith("#settings")) settings.style.display = "flex";
  else settings.style.display = "none";
}
