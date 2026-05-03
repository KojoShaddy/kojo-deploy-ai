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
    return new Promise((resolve) => {
      // This calls the init/setup command of kojo-deploy
      const cmd = `npx --yes kojo-deploy init --project ${projectName} --region ${region}`;

      exec(cmd, (error, stdout, stderr) => {
        if (error) {
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
    service: z.string().describe('The service name to check the status for')
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
