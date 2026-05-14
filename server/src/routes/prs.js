import express from "express";
import authMiddleware from "../middleware/auth.js";
import { syncRepoPRs, getRepoPRs, getRepoPRAnalytics } from "../controllers/prController.js";

const router = express.Router();

router.post("/sync/:repoId", authMiddleware, syncRepoPRs);
router.get("/:repoId", authMiddleware, getRepoPRs);
router.get("/analytics/:repoId", authMiddleware, getRepoPRAnalytics);

export default router;