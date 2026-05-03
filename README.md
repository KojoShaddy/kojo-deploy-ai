# kojo-deploy-ai

[![npm package](https://img.shields.io/badge/npm-kojo--deploy-blue)](https://www.npmjs.com/package/kojo-deploy)
[![github repo](https://img.shields.io/badge/github-repo-black?logo=github)](https://github.com/KojoShaddy/Kojo-Deploy)

### The AI Orchestrator for Google Cloud Run.

`kojo-deploy-ai` is a Gemini CLI extension that brings natural language power to your Google Cloud infrastructure. Built on the Model Context Protocol (MCP), it wraps the `kojo-deploy` toolkit to allow you to manage, monitor, and push containerized services to Google Cloud Run using simple conversational commands.

## Why kojo-deploy-ai?

- **Zero-Install Execution**: Uses `npx` to ensure you always have the latest deployment logic without global bloat.
- **AI-Driven Workflows**: Instead of memorizing complex flags, tell Gemini what you want to achieve.
- **GCP Optimized**: Specifically tuned for Google Cloud Run environments, handling service names, regions, and environment flags natively.
- **MCP Standard**: Built on the Model Context Protocol, ensuring a standardized "bridge" between the LLM and your local system.

## Prerequisites

- **Gemini CLI**: `npm install -g @google/gemini-cli`
- **Google Cloud CLI**: Ensure `gcloud` is installed and authenticated on your machine.
- **Kojo-Deploy**: Your project should have a valid `kojo.json` or configuration compatible with the `kojo-deploy` workflow.

## Installation

Install directly via the Gemini CLI:

```bash
gemini extensions install https://github.com/KojoShaddy/kojo-deploy-ai
```

## Usage Examples

Open the Gemini CLI by typing `gemini` in your terminal. You can now manage your Cloud Run services using natural language:

### Deploying to Cloud Run
> "Deploy the billing-api service to production."
- **Action**: Executes `npx kojo-deploy push billing-api --env prod`

### Checking Service Status
> "What is the current status of my web-frontend on Google Cloud?"
- **Action**: Executes `npx kojo-deploy status web-frontend`

### Intelligent Troubleshooting
> "The last deployment failed. Can you check the status of the auth-service and explain what might be wrong?"

## How it Works

This extension acts as an **MCP Server**. It creates a virtual bridge using Standard I/O to communicate with the Gemini CLI. When you give a command, the AI maps your intent to specialized tools:

| Tool | Action | Description |
| :--- | :--- | :--- |
| `initialize_project` | `npx kojo-deploy init` | Automatically creates `kojo.json` with your project settings. |
| `deploy_service` | `npx kojo-deploy push` | Triggers a Cloud Build and deploys a new revision to Cloud Run. |
| `get_deploy_status` | `npx kojo-deploy status` | Fetches the URL, traffic split, and health of the service. |

## Contributing

As a community-led project by **GDG Accra**, contributions are welcome! Whether it's adding support for Cloud Functions, Secret Manager, or improving the AI's reasoning, feel free to open an issue or submit a PR.

## License

This project is licensed under the MIT License.

---

Built with love by **Shadrack Inusah (Kojo Shaddy)**
*Software Developer | Open Source Contributor | Lead @ GDG Accra*
