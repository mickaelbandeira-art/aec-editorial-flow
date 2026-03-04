import fs from 'fs';
import path from 'path';

const API_KEY = "sk-user-nlawsqfVbU97GCbRb4tzQDVtdyJbjZFvZtJ7rjqg9jk6QBAjiZUnyuZCMt_uyx5US256o8cgyYc0HZSwmWABLEG5kWGyy7Q5cdSBXFZqBOx8EdHimvGpQlxWQjE1BYiBFNo";
const BASE_URL = "https://api.testsprite.com";

async function run() {
    const projectPath = process.cwd();
    // Read the JSON file
    const codeSummaryObj = JSON.parse(fs.readFileSync(path.join(projectPath, 'testsprite_tests', 'tmp', 'code_summary.json'), 'utf-8'));

    console.log("Generating Standard PRD...");
    const form = new FormData();
    const filesToInclude = [
        'package.json',
        'src/App.tsx',
        'src/pages/LoginPage.tsx',
        'src/pages/FlowrevDashboard.tsx'
    ];

    for (const file of filesToInclude) {
        const fullPath = path.join(projectPath, file);
        if (fs.existsSync(fullPath)) {
            const blob = new Blob([fs.readFileSync(fullPath)]);
            form.append('files', blob, path.basename(file));
        }
    }

    // Backend expects a JSON string of the object
    form.append('codeSummary', JSON.stringify(codeSummaryObj));
    form.append('testType', 'frontend');

    try {
        const prdResponse = await fetch(`${BASE_URL}/mcp/common/generate-prd`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            },
            body: form
        });

        if (!prdResponse.ok) {
            const errorText = await prdResponse.text();
            throw new Error(`PRD generation failed: ${prdResponse.status} ${errorText}`);
        }

        const standardPRD = await prdResponse.json();
        const prdPath = path.join(projectPath, 'testsprite_tests', 'standard_prd.json');
        fs.writeFileSync(prdPath, JSON.stringify(standardPRD, null, 2));
        console.log("PRD generated and saved to", prdPath);

        console.log("Generating Frontend Test Plan...");
        const planResponse = await fetch(`${BASE_URL}/mcp/frontend-test/generate-plan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                standard_prd: standardPRD,
                target_scope: 'codebase'
            })
        });

        if (!planResponse.ok) {
            const errorText = await planResponse.text();
            throw new Error(`Plan generation failed: ${planResponse.status} ${errorText}`);
        }

        const testPlan = await planResponse.json();
        const planPath = path.join(projectPath, 'testsprite_tests', 'testsprite_frontend_test_plan.json');
        fs.writeFileSync(planPath, JSON.stringify(testPlan, null, 2));
        console.log("Test Plan generated and saved to", planPath);

        console.log("\nAssets ready. You can now run: npx @testsprite/testsprite-mcp@latest generateCodeAndExecute");

    } catch (error) {
        console.error("Error calling TestSprite API:", error.message);
    }
}

run();
