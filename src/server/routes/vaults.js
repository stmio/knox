import express from "express";
import { getVault, storeVault } from "../controllers/vaultsController.js";

const router = express.Router();

router.get("/", getVault);
router.post("/", storeVault);

export default router;
