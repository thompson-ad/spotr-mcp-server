# SpotrFitnessServer - AI Guidance

## Project Overview

SpotrFitnessServer is an MCP server that enables Claude to act as a fitness programming assistant through the Spotr platform.

## Key Concepts

- This is a **Model Context Protocol (MCP)** server implementation
- It uses Claude as the "brain" to generate fitness content
- The server provides Claude with data access and storage capabilities

## Server Structure

### Core Components

- **Resources**: Data that Claude can access (profiles, program templates)
- **Tools**: Functions Claude can call (store programs, update programs)
- **Prompts**: Templates to guide Claude's responses

## Common Commands

```bash
# Start the server
node server.js

# Run with specific environment variables
API_BASE_URL=https://api.example.com API_KEY=your-key node server.js

# Install dependencies
npm install
```

## Key Files

- `server.js`: Main entry point with MCP server setup
- `.env`: Environment variables (API endpoints, keys)
- `resources/`: MCP resources for data access
- `tools/`: MCP tools for database operations
- `prompts/`: MCP prompts for guiding responses

## Code Patterns

### Resource Pattern

```javascript
server.resource(
  "resource-name",
  "uri-pattern://{param}/resource",
  async (uri, { param }) => {
    // Fetch and return data
    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(data),
          mimeType: "application/json",
        },
      ],
    };
  }
);
```

### Tool Pattern

```javascript
server.tool(
  "tool-name",
  {
    param1: z.string().describe("Parameter description"),
    param2: z.number().describe("Another parameter description"),
  },
  async (params) => {
    // Execute operation with params
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result),
        },
      ],
    };
  }
);
```

### Prompt Pattern

```javascript
server.prompt(
  "prompt-name",
  {
    param1: z.string().describe("Parameter description"),
    param2: z.string().describe("Another parameter description"),
  },
  (params) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Template with ${params.param1} and ${params.param2}`,
          },
        },
      ],
    };
  }
);
```

## Important Implementation Notes

1. **Logging**: Never use `console.log()` with StdioServerTransport; use `console.error()` instead
2. **Error Handling**: Always wrap API calls in try/catch blocks
3. **Response Format**: Follow the standard content format for each tool type

### Tool Design Best Practices

From "Building Effective Agents" by Anthropic:

1. **Give models enough tokens**: Allow "thinking space" before writing
2. **Use familiar formats**: Keep close to naturally occurring text patterns
3. **Avoid formatting overhead**: No need to count lines or escape complex strings
4. **Consider the model's perspective**: Create intuitive agent-computer interfaces
5. **Use clear parameter names**: Write docstrings as if for junior developers
6. **Test extensively**: Identify and fix common model mistakes
7. **Poka-yoke your tools**: Design to prevent errors (e.g., using absolute paths)

## An Example Communication

Let's imagine we have a tool called createGitHubIssue which creates an issue on GitHub.

The MCP client initializing the connection - and start with the client sending a request to the server.

1. List The Tools

```json
// Client sends...
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}
```

This is a request to list all of the tools that are available on the server. The server will respond with a list of tools:

```json
// ...server sends back:
{
  "jsonrpc": "2.0",
  "id": 1,
  "tools": [
    {
      "name": "createGitHubIssue",
      "description": "Create a GitHub issue",
      "inputSchema": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "body": { "type": "string" },
          "labels": {
            "type": "array",
            "items": { "type": "string" }
          }
        }
      }
    }
  ]
}
```

Note how the server responds with the name of the tool, a description, and the required inputs for the tool. The input is a JSON schema describing a title, body and labels.

2. Call The Tool
   The client decides to call the tool, and sends a request:

```json
// Client sends...
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "createGitHubIssue",
    "arguments": {
      "title": "My Issue",
      "body": "This is the body of my issue",
      "labels": ["bug"]
    }
  }
}
```

This describes the name of the tool to be called, and the arguments it should be passed.

The server responds with the result of the tool:

```json
// ...server sends back:
{
  "jsonrpc": "2.0",
  "id": 2,
  "content": [
    {
      "type": "text",
      "text": "Issue 143 created successfully!"
    }
  ],
  "isError": false
}
```

It returns an array of content parts. These content parts can be text - as shown above - or image (for images) and resource for binary data. It also returns an optional isError flag.

If the tool call had errored, the returned object would look slightly different:

```json
// ...if error, server sends back:
{
  "jsonrpc": "2.0",
  "id": 2,
  "content": [
    {
      "type": "text",
      "text": "Error creating issue: Unauthorized"
    }
  ],
  "isError": true
}
```

This tells the client that the tool call was unsuccessful.
