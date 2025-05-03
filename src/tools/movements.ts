import { fetchAllMovements } from "../api.js";
import server from "../server.js";
import { log } from "../utils.js";

export function registerMovementTools() {
  server.tool(
    "fetch-all-movements",
    `Fetch the entire movement library and corresponding demo videos.
    Useful to get a complete picture of all the movements you have at your disposal to design a program or if you are designing programs for full-body training splits where every major muscle group is trained in each session.`,
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
