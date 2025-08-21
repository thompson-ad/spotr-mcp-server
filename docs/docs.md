### MCP servers can provide three main types of capabilities:

1. Resources: File-like data that can be read by clients (like API responses or file contents)
2. Tools: Functions that can be called by the LLM (with user approval)
3. Prompts: Pre-written templates that help users accomplish specific tasks

### When you ask a question:

- The client sends your question to Claude
- Claude analyzes the available tools and decides which one(s) to use
- The client executes the chosen tool(s) through the MCP server
- The results are sent back to Claude
- Claude formulates a natural language response
- The response is displayed to you!

## Planning how to Augment Claude with Resources, Tools and Prompts so that it can serve Spotr

### Agent Goals

- For ('As' when remote) any coach, generate a programme for a client
- For any coach, generate a blueprint from a programme for many clients
- For any coach, generate a programme from a blueprint for a client
- For any coach, refresh a programme for a client
- For any coach, tweak a programme for a client
- For any coach, answer questions about a programme for a client
- For any coach, analyse a clients progress
- For any coach I can evaluate the effectives a given blueprint or programme against a set criteria

initially I will be doing these things on behalf of other coaches because MCP servers can only run locally for now but imagine a future where coaches themselves are using this for there own clients rather than me “imagining” I’m them and doing it for them. What would need to change about the server and is there anything we can do to accommodate for that already?

### Building block: The augmented LLM

You make a request to Claude about creating a program for a client
Claude uses a prompt to guide its approach to the task
Claude accesses resources to get information about the coach's style, the client's profile, and available exercises
Claude calls tools to store the program in your database
Claude provides a response with the results and next steps

With Claude as the primary "engine" for generating, evaluating, and analyzing fitness content, the MCP server becomes more focused on:

1. **Providing context** about coaches, clients, exercises, etc.
2. **Storing and retrieving** the outputs Claude creates
3. **Shuttling data** between Claude and your web application
