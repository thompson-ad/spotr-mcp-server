import Airtable from "airtable";
import { log } from "./utils.js";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

if (!AIRTABLE_API_KEY) {
  console.error(
    "Error: Airtable API key is not set. Please set AIRTABLE_API_KEY environment variable."
  );
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(
  "appTZudz8cnoXORhw"
);

// Available tables in the Airtable base
export const muscleGroups = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
] as const;

export const fetchTableData = async (tableName: string) => {
  try {
    const tableData = await base(tableName).select().all();
    const records = tableData.map((record) => ({
      targetGroup: tableName,
      name: record.get("Name"),
      variation: record.get("Variation"),
      demo: record.get("Client Demo"),
    }));
    return records;
  } catch (error) {
    log(`Error in fetching records for ${tableName}: ${error}`, "error");
    throw error;
  }
};

export const fetchAllData = async () => {
  try {
    const allRecords = await Promise.all(
      muscleGroups.map((t) => fetchTableData(t))
    );
    const flattenedRecords = allRecords.flat();
    return flattenedRecords;
  } catch (error) {
    log(`Error in fetching all records: ${error}`, "error");
    throw error;
  }
};
