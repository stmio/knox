import express from "express";
import { getVault, storeVault } from "../controllers/vaultsController.js";

const router = express.Router();

router.post("/get", getVault);
router.post("/store", storeVault);

export default router;
