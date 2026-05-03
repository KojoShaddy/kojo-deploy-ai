1. Project Initialization
Run these commands in a new directory to set up your environment:

Bash
mkdir kojo-deploy-ai
cd kojo-deploy-ai
npm init -y
npm install @modelcontextprotocol/sdk zod
2. The Manifest (gemini-extension.json)
This file defines how the Gemini CLI identifies and executes your extension.

JSON
{
  "name": "kojo-deploy-ai",
  "version": "1.0.0",
  "description": "AI-powered deployment orchestration for Kojo-Deploy",
  "mcpServers": {
    "kojo_mcp": {
      "command": "node",
      "args": ["${extensionPath}/index.js"],
      "cwd": "${extensionPath}"
    }
  }
}
3. The Bridge Logic (index.js)
This script uses the Model Context Protocol (MCP) to turn your CLI commands into tools Gemini can understand.

JavaScript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { exec } from 'child_process';
import { z } from 'zod';

// Initialize the MCP Server with the new name
const server = new McpServer({
  name: 'kojo-deploy-ai-bridge',
  version: '1.0.0',
});

/**
 * Tool: deploy_service
 * Maps to: npx kojo-deploy push <service> --env <env>
 */
server.registerTool(
  'deploy_service',
  {
    service: z.string().description('The name of the service or application to deploy'),
    env: z.enum(['staging', 'prod', 'dev']).default('staging').description('The target environment (staging, prod, or dev)'),
  },
  async ({ service, env }) => {
    return new Promise((resolve) => {
      // --yes ensures npx doesn't pause for confirmation in the background
      const cmd = `npx --yes kojo-deploy push ${service} --env ${env}`;

      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          resolve({
            content: [{ type: 'text', text: `❌ Deployment failed for ${service}:\n${stderr || error.message}` }],
            isError: true
          });
          return;
        }
        resolve({
          content: [{ type: 'text', text: `✅ Deployment successful!\n\n${stdout}` }]
        });
      });
    });
  }
);

/**
 * Tool: get_deploy_status
 * Maps to: npx kojo-deploy status <service>
 */
server.registerTool(
  'get_deploy_status',
  {
    service: z.string().description('The service name to check the status for')
  },
  async ({ service }) => {
    return new Promise((resolve) => {
      const cmd = `npx --yes kojo-deploy status ${service}`;

      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          resolve({
            content: [{ type: 'text', text: `⚠️ Could not retrieve status for ${service}:\n${stderr || error.message}` }],
            isError: true
          });
          return;
        }
        resolve({
          content: [{ type: 'text', text: stdout || `No status information returned for ${service}.` }]
        });
      });
    });
  }
);

// Establish the connection via Standard Input/Output
const transport = new StdioServerTransport();
await server.connect(transport);
4. Package Configuration (package.json)
Ensure your package.json has the correct metadata and uses ES Modules.

JSON
{
  "name": "kojo-deploy-ai",
  "version": "1.0.0",
  "description": "Zero-install Gemini extension for Kojo-Deploy",
  "type": "module",
  "main": "index.js",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.22.0"
  }
}
5. Final Setup & Local Testing
To start using kojo-deploy-ai immediately on your machine:

Link to Gemini CLI:
Run this command inside your kojo-deploy-ai folder:

Bash
gemini extensions link .
Verify:
Open the Gemini CLI and ask it what it can do:

"What tools does the kojo-deploy-ai extension provide?"

Execute:
Try a real command:

"Check the status of my backend-api and then deploy it to staging if everything looks okay."

By using npx, this sidecar stays extremely lightweight and always pulls the latest version of your core deployment logic without manual updates.