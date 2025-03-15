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

**Design with Multi-Coach Architecture from Day One**

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// API base URL
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api";
const API_KEY = process.env.API_KEY || "test-key";
const WEB_APP_URL = process.env.WEB_APP_URL || "http://localhost:3000";

// Create an MCP server
const server = new McpServer({
  name: "SpotrFitnessServer",
  version: "1.0.0",
});

// ========================
// RESOURCES
// ========================

// Coach profile resource (coach-specific)
server.resource(
  "coach-profile",
  "coach://{coachId}/profile",
  async (uri, { coachId }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/coaches/${coachId}`, {
        headers: {
          "X-API-Key": API_KEY,
          "X-Coach-ID": coachId,
        },
      });

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(response.data),
            mimeType: "application/json",
          },
        ],
      };
    } catch (error) {
      console.error(`Error fetching coach profile for ${coachId}:`, error);
      return {
        contents: [
          {
            uri: uri.href,
            text: `Error fetching profile for coach ${coachId}`,
            mimeType: "text/plain",
          },
        ],
      };
    }
  }
);

// Coach style resource (coach-specific)
server.resource(
  "coach-style",
  "coach://{coachId}/style",
  async (uri, { coachId }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/coaches/${coachId}/style`,
        {
          headers: {
            "X-API-Key": API_KEY,
            "X-Coach-ID": coachId,
          },
        }
      );

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(response.data),
            mimeType: "application/json",
          },
        ],
      };
    } catch (error) {
      console.error(`Error fetching coach style for ${coachId}:`, error);
      return {
        contents: [
          {
            uri: uri.href,
            text: `Error fetching style for coach ${coachId}`,
            mimeType: "text/plain",
          },
        ],
      };
    }
  }
);

// Client profile resource (coach-specific view)
server.resource(
  "client-profile",
  "client://{clientId}/profile",
  async (uri, { clientId }) => {
    try {
      // Note we'll need to get the coachId from context or request
      // For now, we get it from a header or param, but later this would be from auth
      const coachId = getCoachIdFromContext() || "default-coach";

      const response = await axios.get(
        `${API_BASE_URL}/coaches/${coachId}/clients/${clientId}`,
        {
          headers: {
            "X-API-Key": API_KEY,
            "X-Coach-ID": coachId,
          },
        }
      );

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(response.data),
            mimeType: "application/json",
          },
        ],
      };
    } catch (error) {
      console.error(`Error fetching client profile ${clientId}:`, error);
      return {
        contents: [
          {
            uri: uri.href,
            text: `Error fetching client profile ${clientId}`,
            mimeType: "text/plain",
          },
        ],
      };
    }
  }
);

// ========================
// TOOLS
// ========================

// Store program tool (with coach context)
server.tool(
  "store-program",
  {
    coachId: z.string().describe("ID of the coach creating the program"),
    clientId: z.string().describe("ID of the client receiving the program"),
    programName: z.string().describe("Name of the program"),
    // Other parameters as before
  },
  async (params) => {
    try {
      // Note the coach-specific endpoint
      const response = await axios.post(
        `${API_BASE_URL}/coaches/${params.coachId}/programs`,
        params,
        {
          headers: {
            "X-API-Key": API_KEY,
            "X-Coach-ID": params.coachId,
          },
        }
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              programId: response.data.id,
              programUrl: `${WEB_APP_URL}/coaches/${params.coachId}/programs/${response.data.id}`,
              success: true,
            }),
          },
        ],
      };
    } catch (error) {
      console.error("Error storing program:", error);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error storing program: ${
              error.response?.data?.message || error.message
            }`,
          },
        ],
      };
    }
  }
);

// ========================
// PROMPTS
// ========================

// Program generation prompt (coach-specific context)
server.prompt(
  "generate-program-prompt",
  {
    coachId: z.string().describe("ID of the coach"),
    coachName: z.string().describe("Name of the coach"),
    clientId: z.string().describe("ID of the client"),
    clientName: z.string().describe("Name of the client"),
    // Other parameters
  },
  (params) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `As Coach ${params.coachName}, create a fitness program for ${params.clientName} based on your coaching style and philosophy. Access the coach profile using coachId: ${params.coachId} and client details using clientId: ${params.clientId} to ensure the program is personalized appropriately.`,
          },
        },
      ],
    };
  }
);

// Helper function to get coach ID from context (placeholder for now)
function getCoachIdFromContext() {
  // In the future, this would come from authentication
  // For now, return null and require explicit passing
  return null;
}

// Start the server
const transport = new StdioServerTransport();
server.connect(transport).catch((err) => {
  console.error("Error connecting to transport:", err);
  process.exit(1);
});

console.error("SpotrFitnessServer is running on stdio transport");
```

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

### Example flow Creating a New Program

### User Request

"Could you create a strength training program for my client Sarah? She's a 35-year-old intermediate lifter who wants to focus on upper body strength. She can train 4 days per week and has access to a full gym. I want the program to last 8 weeks."

### New Workflow

1. **Claude accesses resources for context**:

   ```typescript
   // Claude accesses coach profile, client profile, exercise library
   ```

2. **Claude generates the program content** using its own capabilities and the context it has gathered

3. **Claude uses the store-program tool to save the program**:

   ```typescript
   // Claude calls: store-program
   const storeParams = {
     coachId: "your-coach-id",
     clientId: "sarah-client-id",
     programName: "Sarah's 8-Week Upper Body Strength",
     durationWeeks: 8,
     sessionsPerWeek: 4,
     primaryGoal: "upper body strength",
     description:
       "A progressive 8-week program focusing on upper body strength for an intermediate lifter",
     programContent: {
       content: [],
       notes:
         "Nutrition should focus on adequate protein intake and slight caloric surplus",
     },
   };
   ```

4. **Claude gets back the storage result** with a program ID and URL

5. **Claude provides the user with a summary and the URL**:

   ```
   I've created an 8-week upper body strength program for Sarah and saved it to your Spotr app. The program includes 4 training days per week with a focus on progressive overload for key upper body movements.

   The program is structured with:
   - 2 push-focused days (Monday, Thursday)
   - 2 pull-focused days (Tuesday, Friday)
   - 3-week accumulation phase followed by 1-week deload
   - 4-week intensification phase

   You and Sarah can access the full program here: https://app.spotr.coach/programs/123456

   Would you like me to explain any specific aspect of the program in more detail?
   ```

#### Why This Revised Approach Works Better

This revised approach offers several advantages:

1. **Leverages Claude's Strengths**: Claude handles the complex, creative work of program design, analysis, and evaluation

2. **Simplifies Integration**: Your web app only needs to store and display what Claude creates, rather than implementing complex fitness logic

3. **Maintains Flexibility**: Claude can generate highly personalized content while your system focuses on storage and distribution

4. **Clear Separation of Concerns**:

   - Claude: Intelligence, creativity, personalization
   - MCP Server: Data shuttling, storage, retrieval
   - Web App: Presentation, user management, sharing

5. **Easier Implementation**: The MCP server tools become simpler - mostly focused on CRUD operations

6. **Scalable Architecture**: As Claude's capabilities improve, your system can immediately benefit without major changes

The key insight is that we're using Claude as the "brain" for your fitness platform, and your MCP server becomes the bridge that helps Claude store its outputs in your system and access the context it needs. This is a powerful pattern that leverages the strengths of both AI and traditional web applications.
