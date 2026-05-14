import express from 'express';
import { handleGitHubWebhook } from '../controllers/webhookController.js';

const router = express.Router();

/**
 * GitHub Webhook Endpoint
 * POST /api/webhooks/github
 *
 * Receives real-time events from GitHub repositories.
 * Supports push, pull_request, and ping events.
 *
 * Headers required:
 * - X-Hub-Signature-256: HMAC-SHA256 signature for verification
 * - X-GitHub-Event: Type of event (push, pull_request, ping)
 * - X-GitHub-Delivery: Unique delivery ID
 */
router.post('/github', handleGitHubWebhook);

export default router;