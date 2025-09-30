import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function createText(text: unknown): CallToolResult['content'][number] {
	if (typeof text === 'string') {
		return { type: 'text', text }
	} else {
		return { type: 'text', text: JSON.stringify(text) }
	}
}

export function log(
  message: string,
  level: "info" | "warn" | "error" = "info"
) {
  const timestamp = new Date().toISOString();
  console.error(`${timestamp} [${level}] ${message}`);
}
