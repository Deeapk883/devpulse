import pool from "../config/db.js";
import { fetchUserRepos } from "../services/githubService.js";

export const getUserRepos = async (req, res) => {
    try {
        const userId = req.user.id;

        const [users] = await pool.query(
            "SELECT * FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                error: "User not found",
            });
        }

        const user = users[0];

        const repos = await fetchUserRepos(user.access_token);

        res.json(repos);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch repositories",
        });
    }
};

export const addTrackedRepo = async (req, res) => {
    try {
        const userId = req.user.id;
        const { github_repo_id, name, full_name, html_url, description } = req.body;

        if (!github_repo_id || !name || !full_name) {
            return res.status(400).json({
                error: "Missing required fields: github_repo_id, name, full_name",
            });
        }

        // Check if already tracked
        const [existing] = await pool.query(
            "SELECT id FROM repositories WHERE user_id = ? AND github_repo_id = ?",
            [userId, github_repo_id]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                error: "Repository already tracked",
            });
        }

        // Insert new tracked repo
        const [result] = await pool.query(
            "INSERT INTO repositories (user_id, github_repo_id, name, full_name, html_url, description) VALUES (?, ?, ?, ?, ?, ?)",
            [userId, github_repo_id, name, full_name, html_url || null, description || null]
        );

        res.status(201).json({
            message: "Repository tracked successfully",
            repoId: result.insertId,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to track repository",
        });
    }
};

export const deleteTrackedRepo = async (req, res) => {
    try {
        const userId = req.user.id;
        const repoId = req.params.id;

        // Check if repo exists and belongs to user
        const [existing] = await pool.query(
            "SELECT id FROM repositories WHERE id = ? AND user_id = ?",
            [repoId, userId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                error: "Tracked repository not found",
            });
        }

        // Delete repo (cascade will handle commits if set up)
        await pool.query(
            "DELETE FROM repositories WHERE id = ? AND user_id = ?",
            [repoId, userId]
        );

        res.json({
            message: "Repository untracked successfully",
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to untrack repository",
        });
    }
};

export const getRepo = async (req, res) => {
    try {
        const userId = req.user.id;
        const repoId = req.params.id;

        // Check if repo is tracked by user
        const [repos] = await pool.query(
            "SELECT id, github_repo_id, name, full_name, html_url, description FROM repositories WHERE id = ? AND user_id = ?",
            [repoId, userId]
        );

        if (repos.length === 0) {
            return res.status(404).json({
                error: "Tracked repository not found",
            });
        }

        res.json(repos[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch repository",
        });
    }
};

export const getTrackedRepos = async (req, res) => {
    try {
        const userId = req.user.id;

        const [repos] = await pool.query(
            "SELECT id, github_repo_id, name, full_name, html_url, description FROM repositories WHERE user_id = ?",
            [userId]
        );

        res.json(repos);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch tracked repositories",
        });
    }
};