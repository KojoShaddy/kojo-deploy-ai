import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { exec } from 'child_process';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Debug logging
const logFile = path.join(process.cwd(), 'mcp-debug.log');
const log = (msg) => {
  try {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
  } catch (e) {
    // Ignore log errors
  }
};

log('MCP Server process starting...');

// Initialize the MCP Server
const server = new McpServer({
  name: 'kojo-deploy-ai-bridge',
  version: '1.0.0',
});

/**
 * Tool: initialize_project
 * Maps to: npx kojo-deploy init --project <projectName> --region <region>
 */
server.registerTool(
  'initialize_project',
  {
    projectName: z.string().describe('The name of the GCP project'),
    region: z.string().default('us-central1').describe('The GCP region')
  },
  async ({ projectName, region }) => {
    log(`Tool call: initialize_project for ${projectName}`);
    return new Promise((resolve) => {
      const cmd = `npx --yes kojo-deploy init --project ${projectName} --region ${region}`;

      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          log(`Error in initialize_project: ${error.message}`);
          resolve({
            content: [{ type: 'text', text: `❌ Initialization failed:\n${stderr || error.message}` }],
            isError: true
          });
          return;
        }
        resolve({
          content: [{ type: 'text', text: stdout || 'Project initialized successfully!' }]
        });
      });
    });
  }
);

/**
 * Tool: deploy_service
 * Maps to: npx kojo-deploy push <service> --env <env>
 */
server.registerTool(
  'deploy_service',
  {
    service: z.string().describe('The name of the service or application to deploy'),
    env: z.enum(['staging', 'prod', 'dev']).default('staging').describe('The target environment (staging, prod, or dev)'),
  },
  async ({ service, env }) => {
    log(`Tool call: deploy_service for ${service} in ${env}`);
    return new Promise((resolve) => {
      const cmd = `npx --yes kojo-deploy push ${service} --env ${env}`;

      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          log(`Error in deploy_service: ${error.message}`);
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
    service: z.string().describe('The service name to check the status for')
  },
  async ({ service }) => {
    log(`Tool call: get_deploy_status for ${service}`);
    return new Promise((resolve) => {
      const cmd = `npx --yes kojo-deploy status ${service}`;

      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          log(`Error in get_deploy_status: ${error.message}`);
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

log('Attempting to connect transport...');
try {
  await server.connect(transport);
  log('Connected successfully.');
} catch (error) {
  log(`Failed to connect: ${error.message}`);
  process.exit(1);
}

// IMPORTANT for Windows: Ensure the process doesn't hang or buffer
process.on('SIGINT', async () => {
  log('Received SIGINT, closing...');
  await server.close();
  process.exit(0);
});