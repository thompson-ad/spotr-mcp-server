# MCP Technical Notes

## MCP Architecture

### Core Components

- **Host**: Program accessing MCP servers (Claude Desktop, etc.)
  - Uses an LLM to analyze available tools
  - Can run multiple clients, each connecting to a different server
- **Client**: Maintains relationship with a single MCP server
  - Each client connects to one server when the host starts
- **Server**: Executes tools called by the host
  - Can run locally or on remote machines
  - Can be implemented in any language (independent from host)
- **Transport**: Communication layer between client and server
  - **stdio**: Standard IO (terminal) for local servers
  - **HTTP/SSE**: Server-sent events for remote servers

### Protocol Details

The MCP protocol uses JSON-RPC 2.0 for message passing:

```json
// Request format
{
  "jsonrpc": "2.0",
  "id": "unique-id",
  "method": "method-name",
  "params": { /* method parameters */ }
}

// Response format
{
  "jsonrpc": "2.0",
  "id": "unique-id",
  "result": { /* result data */ },
  // or
  "error": {
    "code": 123,
    "message": "Error description",
    "data": { /* optional error details */ }
  }
}
```

## Implementation Guidelines

### Proper Logging with StdioServerTransport

- **stdout (`console.log`)**: Reserved for MCP protocol messages only
  - Using console.log will corrupt the protocol communication
- **stderr (`console.error`)**: Safe for internal logging
  - Use for debugging and technical details

### Tool Design Best Practices

From "Building Effective Agents" by Anthropic:

1. **Give models enough tokens**: Allow "thinking space" before writing
2. **Use familiar formats**: Keep close to naturally occurring text patterns
3. **Avoid formatting overhead**: No need to count lines or escape complex strings
4. **Consider the model's perspective**: Create intuitive agent-computer interfaces
5. **Use clear parameter names**: Write docstrings as if for junior developers
6. **Test extensively**: Identify and fix common model mistakes
7. **Poka-yoke your tools**: Design to prevent errors (e.g., using absolute paths)

## Design Philosophy: Claude as the Brain

- **Claude**: Handles intelligence, creativity, and personalization
- **MCP Server**: Manages data shuttling, storage, and retrieval
- **Web App**: Provides presentation, user management, and sharing

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
