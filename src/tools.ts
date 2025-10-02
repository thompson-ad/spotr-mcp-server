import z from "zod";
import { createText, log } from "./utils.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  createProgramSchema,
  updateProgramSchema,
  type createApiClient,
} from "./api.js";

type ToolAnnotations = {
  // defaults to true, so only allow false
  openWorldHint?: false;
} & (
  | {
      // when readOnlyHint is true, none of the other annotations can be changed
      readOnlyHint: true;
    }
  | {
      destructiveHint?: false; // Only allow false (default is true)
      idempotentHint?: true; // Only allow true (default is false)
    }
);

export function registerAllTools(
  server: McpServer,
  api: ReturnType<typeof createApiClient>
) {
  server.registerTool(
    "fetch_all_movements",
    {
      title: "Get all movements",
      description: `Fetch the entire movement library and corresponding demo videos.
    Useful to get a complete picture of all the movements you have at your disposal to design a program.
    You must carefully consider the entire library before creating programs. 
    In some cases, the lirary is extensive and the user will want to see a level of consideration and creativity in your suggestions.
    Note that you are not necessarily limited to the movements you receive from this tool but they should be preferred.
    This tool is likely to be the first tool you use in a new interaction with the user.`,
      annotations: {
        openWorldHint: false,
        readOnlyHint: true,
      } satisfies ToolAnnotations,
    },
    async () => {
      try {
        const allMovements = await api.fetchAllMovements();
        return {
          content: [
            createText(`Fetched all movements! Review them all carefully.`),
            createText(allMovements),
          ],
        };
      } catch (error) {
        log(`Error in fetching all movements: ${error}`, "error");
        return {
          content: [createText(`Error fetching all movements: ${error}`)],
        };
      }
    }
  );

  server.registerTool(
    "fetch_all_programs",
    {
      title: "Get all programs",
      description: `Fetch all the programs you have created.
    Useful to get a complete picture of all the programs you have created.`,
      annotations: {
        openWorldHint: false,
        readOnlyHint: true,
      } satisfies ToolAnnotations,
    },
    async () => {
      try {
        const allPrograms = await api.fetchAllPrograms();
        return {
          content: [
            createText(`Fetched all programs!`),
            createText(allPrograms),
          ],
        };
      } catch (error) {
        log(`Error in fetching all programs: ${error}`, "error");
        return {
          content: [createText(`Error fetching all records: ${error}`)],
        };
      }
    }
  );

  server.registerTool(
    "create_program",
    {
      title: "Create program",
      description: `Create and save a structured workout program based on the user's requirements.

    This tool allows you to create various types of fitness programs with a structured format that can represent strength training, cardio, HIIT, CrossFit, or any combination of exercises organized into days and blocks.

    ## Program Structure
    A program consists of:
    - Program level: name and description
    - Days: ordered by day_number, with optional name/description
    - Blocks: ordered components within days that can have different formats
    - Exercises: individual movements within blocks with modifiable parameters

    ## Format Types
    The \`format_type\` field defines how exercises in a block should be performed:
    - \`standard\`: Traditional sets and reps format
    - \`circuit\`: Sequential exercises to be completed in rounds
    - \`emom\`: Every Minute On the Minute
    - \`amrap\`: As Many Rounds As Possible
    - \`tabata\`: Intervals of high intensity followed by rest
    - \`complex\`: Multiple movements combined into a sequence

    ## Format Parameters
    The \`format_parameters\` field varies based on format type:
    - For \`emom\`: { "time": 20, "time_units": "minutes" }
    - For \`circuit\`: { "rounds": 3 }
    - For \`amrap\`: { "time": 10, "time_units": "minutes" }
    - For \`tabata\`: { "work": 20, "rest": 10, "rounds": 8, "time_units": "seconds" }

    ## Modifiable Parameters
    The \`modifiable_parameters\` field varies based on exercise type:
    - For strength exercises: { "sets": 3, "reps": 10 } or { "reps": "8-10" }
    - For timed exercises: { "time": 30, "time_units": "s" }
    - For distance exercises: { "distance": 1, "distance_units": "km" }
    - For exercises with rest: { "rest": 90, "rest_units": "s" }

    ## Examples

    ### Strength Training Block
    \`\`\`
    {
      "order_index": 0,
      "format_type": "standard",
      "exercises": [
        {
          "order_index": 0,
          "exercise_name": "Bench Press",
          "modifiable_parameters": {
            "sets": 3,
            "reps": "8-10"
          }
        }
      ]
    }
    \`\`\`

    ### EMOM Block
    \`\`\`
    {
      "order_index": 1,
      "format_type": "emom",
      "format_parameters": {
        "time": 12,
        "time_units": "mins"
      },
      "exercises": [
        {
          "order_index": 0,
          "exercise_name": "Kettlebell Swings",
          "modifiable_parameters": {
            "reps": 15
          }
        },
        {
          "order_index": 1,
          "exercise_name": "Push-ups",
          "modifiable_parameters": {
            "reps": 12
          }
        }
      ]
    }
    \`\`\`
    ### Circuit Block
    \`\`\`
    {
      "order_index": 2,
      "format_type": "circuit",
      "format_parameters": {
        "rounds": 3
      },
      "exercises": [
        {
          "order_index": 0,
          "exercise_name": "Pull-ups",
          "modifiable_parameters": {
            "reps": 8
          }
        },
        {
          "order_index": 1,
          "exercise_name": "Burpees",
          "modifiable_parameters": {
            "reps": 10
          }
        }
      ]
    }
    \`\`\`

    ### Running Intervals
    \`\`\`
    {
      "order_index": 0,
      "name": "Speed Work",
      "exercises": [
        {
          "order_index": 0,
          "exercise_name": "Run",
          "modifiable_parameters": {
            "distance": 400,
            "distance_units": "m",
            "rest": 90,
            "rest_units": "s"
          }
        }
      ]
    }
    \`\`\`

    Use this tool to create a complete program with multiple days, blocks, and exercises that match the user's fitness goals and preferences.
    Note that before using this tool, ensure you have fetched all the movements avaialble to you. You cannot prescribe exercises before knowing what movements are available. 
    You are not necessarily limited to the movements you receive from the fetch-all-movements tool but they should be preferred.`,
      annotations: {
        openWorldHint: false,
        destructiveHint: false,
      } satisfies ToolAnnotations,
      inputSchema: { program: createProgramSchema },
    },
    async ({ program }) => {
      try {
        const newProgram = await api.createProgram(program);
        return {
          content: [
            createText(`Created the new program!`),
            createText(newProgram),
          ],
        };
      } catch (error) {
        log(`Error creating program: ${error}`, "error");
        return {
          content: [createText(`Error creating program: ${error}`)],
        };
      }
    }
  );

  server.registerTool(
    "update_program",
    {
      title: "Update program",
      description: `Update a previously created program based on user feedback and preferences.

    **Behavior**:
      - Updates only what's provided in the request
      - Doesn't affect entities that aren't included
      - Matches entities by their position (day_number, order_index)
      - Creates new entities if they don't exist
    **Request Examples**:
      \`\`\`json
      // Example 1: Update program metadata only
      {
        "name": "Updated Program Name",
        "description": "Updated Description"
      }

      // Example 2: Update specific day
      {
        "name": "Program Name",
        "description": "Program Description",
        "days": [
          {
            "day_number": 2,
            "name": "Updated Day Name",
            "description": "Updated Day Description"
          }
        ]
      }

      // Example 3: Update specific exercise
      {
        "days": [
          {
            "day_number": 1,
            "blocks": [
              {
                "order_index": 2,
                "exercises": [
                  {
                    "order_index": 3,
                    "exercise_name": "Updated Exercise",
                    "modifiable_parameters": {
                      "sets": 4,
                      "reps": "12"
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
      \`\`\`

    Use this tool when a user has feedback on a previously created program that they want you to incorporate.
    
    NOTE: to use this tool you need the ID of the program you wish to update. 
    If you do not already have it, you can get a list of all the programs you have made for this user along with their IDs using the fetch-all-programs tool.`,
      inputSchema: { programId: z.string(), update: updateProgramSchema },
      annotations: {
        openWorldHint: false,
        destructiveHint: false,
      } satisfies ToolAnnotations,
    },
    async ({ programId, update }) => {
      try {
        const newProgram = await api.updateProgram(programId, update);
        return {
          content: [
            createText(`Successfully updated program`),
            createText(newProgram),
          ],
        };
      } catch (error) {
        log(`Error updating program: ${error}`, "error");
        return {
          content: [createText(`Error updating program: ${error}`)],
        };
      }
    }
  );

  server.registerTool(
    "fetch_program",
    {
      title: "Get program",
      description: `Get an entire program.
     NOTE: to use this tool you need the ID of the program you wish to get. 
     If you do not already have it, you can get a list of all the programs you have made for this user along with their IDs using the fetch-all-programs tool.`,
      inputSchema: { programId: z.string() },
      annotations: {
        openWorldHint: false,
        readOnlyHint: true,
      } satisfies ToolAnnotations,
    },
    async ({ programId }) => {
      try {
        const program = await api.fetchProgram(programId);
        return {
          content: [createText(`Fetched program!`), createText(program)],
        };
      } catch (error) {
        log(`Error fetching program: ${error}`, "error");
        return {
          content: [createText(`Error fetching program: ${error}`)],
        };
      }
    }
  );

  server.registerTool(
    "delete_program",
    {
      title: "Delete program",
      description: `Delete an entire program.
     You may wish to use this tool in some cases where it is simply easier to delete a program and re-write it rather than do partial updates. 
     This might be the case if the user wants to start from scratch or if feedback suggests they are very unhappy with the current suggestion.

     NOTE: to use this tool you need the ID of the program you wish to delete. 
     If you do not already have it, you can get a list of all the programs you have made for this user along with their IDs using the fetch-all-programs tool.`,
      inputSchema: { programId: z.string() },
      annotations: { openWorldHint: false, destructiveHint: true },
    },
    async ({ programId }) => {
      try {
        await api.deleteProgram(programId);
        return {
          content: [createText(`Successfully deleted program`)],
        };
      } catch (error) {
        log(`Error deleting program: ${error}`, "error");
        return {
          content: [createText(`Error deleting program: ${error}`)],
        };
      }
    }
  );
}
