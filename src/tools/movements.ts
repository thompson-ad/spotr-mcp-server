import { fetchAllMovements } from "../api.js";
import server from "../server.js";
import { log } from "../utils.js";

export function registerMovementTools() {
  server.tool(
    "fetch-all-movements",
    `Fetch the entire movement library and corresponding demo videos.
    Useful to get a complete picture of all the movements you have at your disposal to design a program.
    You must carefully consider the entire library before creating programs. 
    In some cases, the lirary is extensive and the user will want to see a level of consideration and creativity in your suggestions.
    Note that you are not necessarily limited to the movements you receive from this tool but they should be preferred.
    This tool is likely to be the first tool you use in a new interaction with the user.`,
    async () => {
      try {
        const allMovements = await fetchAllMovements();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(allMovements, null, 2),
            },
          ],
        };
      } catch (error) {
        log(`Error in fetching all records: ${error}`, "error");
        return {
          content: [
            {
              type: "text",
              text: `Error fetching all records: ${error}`,
            },
          ],
        };
      }
    }
  );
}
