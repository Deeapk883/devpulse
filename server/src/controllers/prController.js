import pool from "../config/db.js";
import { fetchRepoPRs } from "../services/githubService.js";

export const syncRepoPRs = async (req, res) => {
    try {
        const userId = req.user.id;
        const repoId = req.params.repoId;

        // Check if repo is tracked by user
        const [repos] = await pool.query(
            "SELECT * FROM repositories WHERE id = ? AND user_id = ?",
            [repoId, userId]
        );

        if (repos.length === 0) {
            return res.status(404).json({
                error: "Tracked repository not found",
            });
        }

        const repo = repos[0];
        const [owner, repoName] = repo.full_name.split('/');

        // Get user access token
        const [users] = await pool.query(
            "SELECT access_token FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                error: "User not found",
            });
        }

        const accessToken = users[0].access_token;

        // Fetch PRs (for MVP, fetch first page)
        const prs = await fetchRepoPRs(accessToken, owner, repoName);

        // Map and bulk insert, avoiding duplicates
        const prData = prs.map(pr => [
            repoId,
            pr.id,
            pr.title,
            pr.state,
            pr.additions || 0,
            pr.deletions || 0,
            new Date(pr.created_at),
            pr.merged_at ? new Date(pr.merged_at) : null,
            pr.user?.login || 'Unknown',
            JSON.stringify(pr.requested_reviewers?.map(r => r.login) || []),
            pr.merged_at ? Math.floor((new Date(pr.merged_at) - new Date(pr.created_at)) / (1000 * 60)) : null,
        ]);

        if (prData.length > 0) {
            // Use INSERT IGNORE or ON DUPLICATE KEY UPDATE to avoid duplicates
            await pool.query(
                `INSERT INTO pull_requests (repo_id, github_pr_id, title, state, additions, deletions, created_at, merged_at, user, reviewers, review_time_minutes) VALUES ?
                 ON DUPLICATE KEY UPDATE
                 title = VALUES(title),
                 state = VALUES(state),
                 additions = VALUES(additions),
                 deletions = VALUES(deletions),
                 merged_at = VALUES(merged_at),
                 reviewers = VALUES(reviewers),
                 review_time_minutes = VALUES(review_time_minutes)`,
                [prData]
            );
        }

        res.json({
            message: "Pull requests synced successfully",
            syncedCount: prData.length,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to sync pull requests",
        });
    }
};

export const getRepoPRs = async (req, res) => {
    try {
        const userId = req.user.id;
        const repoId = req.params.repoId;

        // Check if repo is tracked by user
        const [repos] = await pool.query(
            "SELECT id FROM repositories WHERE id = ? AND user_id = ?",
            [repoId, userId]
        );

        if (repos.length === 0) {
            return res.status(404).json({
                error: "Tracked repository not found",
            });
        }

        // Fetch PRs for the repo
        const [prs] = await pool.query(
            "SELECT * FROM pull_requests WHERE repo_id = ? ORDER BY created_at DESC",
            [repoId]
        );

        res.json(prs);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch pull requests",
        });
    }
};

export const getRepoPRAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const repoId = req.params.repoId;

        // Check if repo is tracked by user
        const [repos] = await pool.query(
            "SELECT id FROM repositories WHERE id = ? AND user_id = ?",
            [repoId, userId]
        );

        if (repos.length === 0) {
            return res.status(404).json({
                error: "Tracked repository not found",
            });
        }

        // Compute analytics
        const [totalPRs] = await pool.query(
            "SELECT COUNT(*) as total FROM pull_requests WHERE repo_id = ?",
            [repoId]
        );

        const [openPRs] = await pool.query(
            "SELECT COUNT(*) as open FROM pull_requests WHERE repo_id = ? AND state = 'open'",
            [repoId]
        );

        const [mergedPRs] = await pool.query(
            "SELECT COUNT(*) as merged FROM pull_requests WHERE repo_id = ? AND state = 'closed' AND merged_at IS NOT NULL",
            [repoId]
        );

        const [avgReviewTime] = await pool.query(
            "SELECT AVG(review_time_minutes) as avg_time FROM pull_requests WHERE repo_id = ? AND review_time_minutes IS NOT NULL",
            [repoId]
        );

        const analytics = {
            totalPRs: totalPRs[0].total,
            openPRs: openPRs[0].open,
            mergedPRs: mergedPRs[0].merged,
            avgReviewTimeMinutes: avgReviewTime[0].avg_time ? Math.round(avgReviewTime[0].avg_time) : null,
        };

        res.json(analytics);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch PR analytics",
        });
    }
};