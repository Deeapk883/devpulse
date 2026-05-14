import express from "express";
import authMiddleware from "../middleware/auth.js";
import { syncRepoCommits, getRepoCommits } from "../controllers/commitController.js";

const router = express.Router();

router.get("/:repoId", authMiddleware, getRepoCommits);
router.post("/sync/:repoId", authMiddleware, syncRepoCommits);

export default router;