import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({
  name: "Spotr",
  version: "1.0.0",
  capabilities: {
    resources: {},
    logging: {},
  },
});

export default server;
