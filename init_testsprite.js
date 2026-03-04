import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const path = require('path');
const fs = require('fs');

async function run() {
    const testspriteTestsDir = path.join(process.cwd(), 'testsprite_tests', 'tmp');
    if (!fs.existsSync(testspriteTestsDir)) {
        fs.mkdirSync(testspriteTestsDir, { recursive: true });
    }

    const API_KEY = "sk-user-nlawsqfVbU97GCbRb4tzQDVtdyJbjZFvZtJ7rjqg9jk6QBAjiZUnyuZCMt_uyx5US256o8cgyYc0HZSwmWABLEG5kWGyy7Q5cdSBXFZqBOx8EdHimvGpQlxWQjE1BYiBFNo";

    const executionArgs = {
        type: "frontend",
        localEndpoint: "http://localhost:8080",
        projectName: "AeC Editorial Flow",
        projectPath: process.cwd(),
        api_key: API_KEY,
        envs: {
            PORT: "8080",
            BASE_URL: "http://localhost:8080",
            API_KEY: API_KEY
        }
    };

    const config = {
        executionArgs: executionArgs,
        // Include top-level fields for the internal _generateCodeAndExecute call
        ...executionArgs
    };

    fs.writeFileSync(path.join(testspriteTestsDir, 'config.json'), JSON.stringify(config, null, 2));
    console.log("Updated config.json with executionArgs wrapper.");
}

run().catch(console.error);
