import "~/style.css";
import knoxLogo from "/knox.svg";
import { hex } from "@/utils.js";
import axios from "axios";

document.querySelector(".logo").src = knoxLogo;

const session = JSON.parse(sessionStorage.getItem("session"));
sessionStorage.removeItem("session");

const { K, identity, device } = {
  K: hex.toBigInt(session?.K || 0n),
  identity: session?.identity,
  device: session?.deviceID,
};

if (K === 0n) window.location.href = "/login/";
