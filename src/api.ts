import { fetchJSON } from "./fetch.js";

type MuscleGroup = "Chest" | "Back" | "Shoulders" | "Arms" | "Legs" | "Core";

// TODO: this response might be different if the movements library source is different
// may need to be normalised across sources and cleaned up
interface Movement {
  name: string;
  variation: string;
  client_demo: string;
}

interface MovementsResponse {
  movements: {
    [muscleGroup in MuscleGroup]: Movement[];
  };
}

// fetch all movements
// Todo, how do we handle thrown errors in MCP?
export const fetchAllMovements = async () => {
  const data = await fetchJSON<MovementsResponse>("/api/movements");
  return data.movements;
};
