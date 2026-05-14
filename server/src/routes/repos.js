import express from "express";
import authMiddleware from "../middleware/auth.js";
import { getUserRepos, getRepo, getTrackedRepos, addTrackedRepo, deleteTrackedRepo } from "../controllers/repoController.js";

const router = express.Router();

router.get("/", authMiddleware, getUserRepos);
router.get("/tracked", authMiddleware, getTrackedRepos);
router.get("/:id", authMiddleware, getRepo);
router.post("/", authMiddleware, addTrackedRepo);
router.delete("/:id", authMiddleware, deleteTrackedRepo);

export default router;