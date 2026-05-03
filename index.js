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
  async (args) => {
    log(`Tool call: initialize_project with args: ${JSON.stringify(args)}`);
    
    // Destructure after logging to see what we actually got
    const { projectName, region } = args;
    
    if (!projectName) {
      return {
        content: [{ type: 'text', text: '❌ Error: projectName is required but was undefined.' }],
        isError: true
      };
    }

    return new Promise((resolve) => {
      // Use npx.cmd on Windows to avoid execution policy issues
      const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
      const cmd = `${npxCmd} --yes kojo-deploy init --project ${projectName} --region ${region}`;

      log(`Executing command: ${cmd}`);

      exec(cmd, { timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
          log(`Error in initialize_project: ${error.message}`);
          resolve({
            content: [{ type: 'text', text: `❌ Initialization failed:\n${stderr || error.message}` }],
            isError: true
          });
          return;
        }
        log(`Command output: ${stdout}`);
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
  async (args) => {
    log(`Tool call: deploy_service with args: ${JSON.stringify(args)}`);
    const { service, env } = args;

    if (!service) {
      return {
        content: [{ type: 'text', text: '❌ Error: service name is required.' }],
        isError: true
      };
    }

    return new Promise((resolve) => {
      const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
      const cmd = `${npxCmd} --yes kojo-deploy push ${service} --env ${env}`;

      log(`Executing command: ${cmd}`);

      exec(cmd, { timeout: 120000 }, (error, stdout, stderr) => {
        if (error) {
          log(`Error in deploy_service: ${error.message}`);
          resolve({
            content: [{ type: 'text', text: `❌ Deployment failed for ${service}:\n${stderr || error.message}` }],
            isError: true
          });
          return;
        }
        log(`Command output: ${stdout}`);
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
  async (args) => {
    log(`Tool call: get_deploy_status with args: ${JSON.stringify(args)}`);
    const { service } = args;

    if (!service) {
      return {
        content: [{ type: 'text', text: '❌ Error: service name is required.' }],
        isError: true
      };
    }

    return new Promise((resolve) => {
      const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
      const cmd = `${npxCmd} --yes kojo-deploy status ${service}`;

      log(`Executing command: ${cmd}`);

      exec(cmd, { timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
          log(`Error in get_deploy_status: ${error.message}`);
          resolve({
            content: [{ type: 'text', text: `⚠️ Could not retrieve status for ${service}:\n${stderr || error.message}` }],
            isError: true
          });
          return;
        }
        log(`Command output: ${stdout}`);
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