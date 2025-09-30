#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { log } from "./utils.js";
import { registerAllTools } from './tools.js';
import { createFetchClient, type FetchConfig } from './fetch.js';
import { createApiClient } from './api.js';

function validateAndGetConfig(): FetchConfig {
  const baseUrl = process.env.SPOTR_BASE_URL;
  const apiKey = process.env.SPOTR_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("SPOTR_BASE_URL and SPOTR_API_KEY must be set");
  }

  return { baseUrl, apiKey };
}

async function main() {
  try {
    log("Starting Spotr MCP Server");

    // Validate config and create dependencies
    const config = validateAndGetConfig();
    const fetchClient = createFetchClient(config);
    const api = createApiClient(fetchClient);

    // Create MCP server
    const server = new McpServer({
      name: "spotr",
      title: "Spotr",
      version: "1.0.0",
    }, 
    {
      capabilities: {
        tools: {},
      },
      instructions: `
Spotr: Personal training server with AI-powered program creation and editing.

## Core Workflow
- Create Program: \`fetch-all-movements\` → draft program and present to user -> \`create-program\`
- Edit Program: make edits and present to user. Once user confirms -> \`update-program\` (if you have the program ID). Note that you may need to fetch the proram before you edit it to confirm with the user which program they want editing -> \`fetch-all-programs\` (if you do not have program ID in memory), \`fetch-program\` (if you have program ID in memory but not amy details). 

## Best Practices
- \`fetch-all-movements\` before creating a program so that you know what exercises you have to work with.
- confirm with the user that they are happy with the program before creating or editing programs to avoid unnecessary writes to the database.

## Common Requests
- "Make me a program for 'x'" → create program workflow
- "Change my current program to be more 'x'" → edit program workflow
      `.trim(),
    });

    // Register tools with dependencies
    registerAllTools(server, api);

    // Connect to transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    log("Spotr MCP Server running on stdio transport");
  } catch (error) {
    log(`Failed to start server: ${error}`, "error");
    process.exit(1);
  }
}

main().catch((error) => {
  log(`Fatal error in main(): ${error}`, "error");
  process.exit(1);
});
