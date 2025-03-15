import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// The McpServer is your core interface to the MCP protocol. It handles connection management, protocol compliance, and message routing:
const server = new McpServer({
  name: "Spotr",
  version: "1.0.0",
  capabilities: {
    resources: {},
    logging: {},
  },
});

export default server;
