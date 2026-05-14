#!/usr/bin/env node

// Simple webhook test script
// Run with: node test-webhook.js

import crypto from 'crypto';
import fetch from 'node-fetch';

const WEBHOOK_SECRET = 'devpulse_webhook_secret_2024';
const WEBHOOK_URL = 'http://localhost:5000/api/webhooks/github';

// Test ping event
const testPayload = {
    repository: {
        id: 12345,
        full_name: 'test/repo'
    },
    hook_id: 67890
};

// Create signature
const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(testPayload))
    .digest('hex');

const headers = {
    'Content-Type': 'application/json',
    'X-GitHub-Event': 'ping',
    'X-GitHub-Delivery': `test-${Date.now()}`,
    'X-Hub-Signature-256': `sha256=${signature}`
};

try {
    const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(testPayload)
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response body:', result);
} catch (error) {
    console.error('Test failed:', error.message);
}