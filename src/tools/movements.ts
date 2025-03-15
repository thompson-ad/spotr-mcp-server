import { z } from "zod";
import { fetchAllData, muscleGroups, fetchTableData } from "../api.js";
import server from "../server.js";
import { log } from "../utils.js";

export function registerMovementTools() {
  // Todo: give coach context - get coaches movements library
  server.tool(
    "fetch-all-movements",
    `Fetch the entire movement library and corresponding demo videos.
    Useful to get a complete picture of all the movements you have at your disposal to design a program or if you are designing programs for full-body training splits where every major muscle group is trained in each session.`,
    async () => {
      try {
        const allRecords = await fetchAllData();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(allRecords, null, 2),
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

  server.tool(
    "fetch-movements-by-muscle-group",
    `Fetch movements by muscle group from the movements library with corresponding demo videos.
    Useful when designing programs for training splits like Push, Pull, Legs or anything more granular than full body training.`,
    {
      muscleGroup: z
        .enum(muscleGroups)
        .describe(
          "The muscle group to fetch movements for. Must be one of: " +
            muscleGroups.join(", ")
        ),
    },
    async ({ muscleGroup }) => {
      try {
        const records = await fetchTableData(muscleGroup);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(records, null, 2),
            },
          ],
        };
      } catch (error) {
        log(`Error in fetching records for ${muscleGroup}: ${error}`, "error");
        return {
          content: [
            {
              type: "text",
              text: `Error fetching records for ${muscleGroup}: ${error}`,
            },
          ],
        };
      }
    }
  );
}
