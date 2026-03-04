import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';

const API_KEY = "sk-user-nlawsqfVbU97GCbRb4tzQDVtdyJbjZFvZtJ7rjqg9jk6QBAjiZUnyuZCMt_uyx5US256o8cgyYc0HZSwmWABLEG5kWGyy7Q5cdSBXFZqBOx8EdHimvGpQlxWQjE1BYiBFNo";
const BASE_URL = "https://api.testsprite.com";

async function run() {
    const projectPath = process.cwd();
    const prdPath = path.join(projectPath, 'testsprite_tests', 'standard_prd.json');

    if (!fs.existsSync(prdPath)) {
        console.error("PRD file not found. Please run the generation script first.");
        return;
    }

    const standardPRD = JSON.parse(fs.readFileSync(prdPath, 'utf-8'));

    console.log("Generating Frontend Test Plan (this may take several minutes)...");

    try {
        const response = await fetch(`${BASE_URL}/mcp/frontend-test/generate-plan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                standard_prd: standardPRD,
                target_scope: 'codebase'
            }),
            signal: AbortSignal.timeout(600000) // 10 minutes timeout
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Plan generation failed: ${response.status} ${errorText}`);
        }

        const testPlan = await response.json();
        const planPath = path.join(projectPath, 'testsprite_tests', 'testsprite_frontend_test_plan.json');
        fs.writeFileSync(planPath, JSON.stringify(testPlan, null, 2));
        console.log("Test Plan generated and saved to", planPath);

    } catch (error) {
        console.error("Error calling TestSprite API:", error.message);
    }
}

run();
