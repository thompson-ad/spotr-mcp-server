### Implementing Proper Logging with StdioServerTransport

When using StdioServerTransport, the server communicates with the client through standard input/output streams. This means:

stdout (console.log) - Reserved for the MCP protocol messages
stderr (console.error) - Can be safely used for logging without interfering with the protocol

The server sends JSON-RPC messages to the client via stdout, so using console.log will corrupt this communication channel and break the protocol. That's why we need to be careful with our logging approach.

- Use console.error extensively for internal debugging and technical details that only you need to see
- Use server.server.sendLoggingMessage sparingly for important information that users should be aware of

### Prompt engineering your tools

**Excerpt from "Building effectuve agents" by Anthropic**

No matter which agentic system you're building, tools will likely be an important part of your agent. Tools enable Claude to interact with external services and APIs by specifying their exact structure and definition in our API. When Claude responds, it will include a tool use block in the API response if it plans to invoke a tool. Tool definitions and specifications should be given just as much prompt engineering attention as your overall prompts. In this brief appendix, we describe how to prompt engineer your tools.

There are often several ways to specify the same action. For instance, you can specify a file edit by writing a diff, or by rewriting the entire file. For structured output, you can return code inside markdown or inside JSON. In software engineering, differences like these are cosmetic and can be converted losslessly from one to the other. However, some formats are much more difficult for an LLM to write than others. Writing a diff requires knowing how many lines are changing in the chunk header before the new code is written. Writing code inside JSON (compared to markdown) requires extra escaping of newlines and quotes.

Our suggestions for deciding on tool formats are the following:

Give the model enough tokens to "think" before it writes itself into a corner.
Keep the format close to what the model has seen naturally occurring in text on the internet.
Make sure there's no formatting "overhead" such as having to keep an accurate count of thousands of lines of code, or string-escaping any code it writes.
One rule of thumb is to think about how much effort goes into human-computer interfaces (HCI), and plan to invest just as much effort in creating good agent-computer interfaces (ACI). Here are some thoughts on how to do so:

Put yourself in the model's shoes. Is it obvious how to use this tool, based on the description and parameters, or would you need to think carefully about it? If so, then it’s probably also true for the model. A good tool definition often includes example usage, edge cases, input format requirements, and clear boundaries from other tools.
How can you change parameter names or descriptions to make things more obvious? Think of this as writing a great docstring for a junior developer on your team. This is especially important when using many similar tools.
Test how the model uses your tools: Run many example inputs in our workbench to see what mistakes the model makes, and iterate.
Poka-yoke your tools. Change the arguments so that it is harder to make mistakes.
While building our agent for SWE-bench, we actually spent more time optimizing our tools than the overall prompt. For example, we found that the model would make mistakes with tools using relative filepaths after the agent had moved out of the root directory. To fix this, we changed the tool to always require absolute filepaths—and we found that the model used this method flawlessly.
