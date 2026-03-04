import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

// Helper to find index.js
const npxDir = 'C:/Users/User/AppData/Local/npm-cache/_npx/8ddf6bea01b2519d/node_modules/@testsprite/testsprite-mcp/dist';
const indexPath = path.join(npxDir, 'index.js');

async function run() {
    console.log("🚀 Running TestSprite Execution Script...");

    // Import the package
    const mcp = await import(`file://${indexPath}`);

    // We need to find the _generateCodeAndExecute function or generateCodeAndExecute
    // It's likely not exported directly if it's a private function, but we can try to find it in the module object.

    const projectPath = process.cwd();
    const configPath = path.join(projectPath, 'testsprite_tests', 'tmp', 'config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    const executionArgs = config.executionArgs;

    // Ensure testIds is there
    executionArgs.testIds = executionArgs.testIds || [];

    console.log("Using executionArgs:", JSON.stringify(executionArgs, null, 2));

    // Set environment variables
    Object.entries(executionArgs.envs || {}).forEach(([key, value]) => {
        process.env[key] = String(value);
    });

    // Try to find the function in the imported module
    const fn = mcp._generateCodeAndExecute || mcp.generateCodeAndExecute;

    if (typeof fn !== 'function') {
        console.error("❌ Could not find execution function in MCP module.");
        console.log("Available exports:", Object.keys(mcp));
        process.exit(1);
    }

    try {
        await fn(executionArgs, "console");
        console.log("✅ Execution finished successfully.");
    } catch (error) {
        console.error("❌ Execution failed:", error);
        process.exit(1);
    }
}

run();
