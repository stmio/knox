import express from "express";
import {
  getVault,
  storeVault,
  updateVault,
} from "../controllers/vaultsController.js";

const router = express.Router();

router.post("/get", getVault);
router.post("/store", storeVault);
router.post("/update", updateVault);

export default router;
