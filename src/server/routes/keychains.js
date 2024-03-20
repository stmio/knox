import express from "express";
import {
  getKeychain,
  storeKeychain,
} from "../controllers/keychainsController.js";

const router = express.Router();

router.post("/get", getKeychain);
router.post("/store", storeKeychain);

export default router;
