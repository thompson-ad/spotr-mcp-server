import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import server from "./server.js";
import { log } from "./utils.js";
import { registerAllResources } from "./resources/index.js";
import { registerAllTools } from "./tools/index.js";

async function main() {
  try {
    log("Starting Spotr MCP Server");

    registerAllResources();
    registerAllTools();

    const transport = new StdioServerTransport();
    await server.connect(transport);

    // server.server.sendLoggingMessage({
    //   level: "info",
    //   data: "Spotr Exercise Library server started successfully",
    // });

    log("Spotr MCP Server running on stdio transport");
  } catch (error) {
    log(`Failed to start server: ${error}`, "error");
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  log("Received SIGINT signal, shutting down gracefully", "info");
  server
    .close()
    .then(() => {
      log("Server closed successfully", "info");
      process.exit(0);
    })
    .catch((err) => {
      log(`Error during shutdown: ${err}`, "error");
      process.exit(1);
    });
});

main().catch((error) => {
  log(`Fatal error in main(): ${error}`, "error");
  process.exit(1);
});
