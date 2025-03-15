import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchAllData, fetchTableData, muscleGroups } from "../api.js";
import server from "../server.js";
import { log } from "../utils.js";

export function registerMovementResources() {
  server.resource(
    "movements-library",
    "movements://library",
    {
      name: "Movements Library",
      description:
        "A complete library of movements for creating programs. Every movements comes with a demo video.",
      mimeType: "application/json",
    },
    async (uri) => {
      try {
        const allRecords = await fetchAllData();
        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(allRecords, null, 2),
              mimeType: "application/json",
            },
          ],
        };
      } catch (error) {
        log(`Error in fetching all records: ${error}`, "error");
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching all records: ${error}`,
              mimeType: "text/plain",
            },
          ],
        };
      }
    }
  );

  server.resource(
    "movements-by-muscle-group",
    new ResourceTemplate("movements://muscle-group/{group}", {
      list: async () => {
        return {
          resources: muscleGroups.map((mg) => ({
            uri: `movements://muscle-group/${mg}`,
            name: `${mg} Movements`,
          })),
        };
      },
    }),
    {
      description:
        "A list of movements for a specific muscle group for creating programs. Each movement comes with a demo video.",
      mimeType: "application/json",
    },
    async (uri, { group }) => {
      try {
        const records = await fetchTableData(group as string);
        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(records, null, 2),
              mimeType: "application/json",
            },
          ],
        };
      } catch (error) {
        log(`Error in fetching records for ${group}: ${error}`, "error");
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching records for ${group}: ${error}`,
              mimeType: "text/plain",
            },
          ],
        };
      }
    }
  );
}
