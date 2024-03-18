import express from "express";
import {
  getKeychain,
  storeKeychain,
} from "../controllers/keychainsController.js";

const router = express.Router();

router.get("/", getKeychain);
router.post("/", storeKeychain);

export default router;
