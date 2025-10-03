import { z } from "zod";
import type { createFetchClient } from "./fetch.js";

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
  [key: string]: unknown; // Index signature for MCP compatibility
}

interface FetchAllProgramsResponse {
  programs: {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
  }[];
  [key: string]: unknown; // Index signature for MCP compatibility
}

interface ProgramExercise {
  id: string;
  order_index: number;
  exercise_name: string;
  video_url: string | null;
  notes: string | null;
  modifiable_parameters: Record<string, unknown> | null;
}

export enum ProgramBlockFormatType {
  STANDARD = "standard",
  CIRCUIT = "circuit",
  AMRAP = "amrap",
  EMOM = "emom",
  TABATA = "tabata",
  COMPLEX = "complex",
}

interface ProgramBlock {
  id: string;
  order_index: number;
  name: string | null;
  description: string | null;
  format_type: ProgramBlockFormatType | null;
  format_parameters: Record<string, unknown> | null;
  exercises: ProgramExercise[];
}

interface ProgramDay {
  id: string;
  name: string | null;
  description: string | null;
  day_number: number;
  blocks: ProgramBlock[];
}

interface Program {
  id: string;
  coach_id: string;
  member_id: string;
  tenant_id: string;
  organization_id: string | null;
  name: string;
  description: string | null;
  days: ProgramDay[];
  created_at: string;
  updated_at: string;
  [key: string]: unknown; // Index signature for MCP compatibility
}

interface ProgramResponse {
  program: Program;
}

interface CreateProgramExercise {
  order_index: number;
  exercise_name: string;
  video_url: string | null;
  notes: string | null;
  modifiable_parameters: Record<string, unknown> | null;
}

interface CreateProgramBlock {
  order_index: number;
  name: string | null;
  description: string | null;
  format_type: ProgramBlockFormatType | null;
  format_parameters: Record<string, unknown> | null;
  exercises: CreateProgramExercise[];
}

interface CreateProgramDay {
  name: string | null;
  description: string | null;
  day_number: number;
  blocks: CreateProgramBlock[];
}

interface CreateProgramRequest {
  name: string;
  description: string | null;
  days: CreateProgramDay[];
}

interface UpdateProgramExercise {
  order_index: number;
  exercise_name?: string;
  video_url?: string;
  notes?: string;
  modifiable_parameters?: Record<string, unknown>;
}

interface UpdateProgramBlock {
  order_index: number;
  name?: string;
  description?: string;
  format_type?: ProgramBlockFormatType;
  format_parameters?: Record<string, unknown>;
  exercises?: UpdateProgramExercise[];
}

interface UpdateProgramDay {
  day_number: number;
  name?: string;
  description?: string;
  blocks?: UpdateProgramBlock[];
}

interface UpdateProgramRequest {
  name?: string;
  description?: string | null;
  days?: UpdateProgramDay[];
}

export function createApiClient(
  fetchClient: ReturnType<typeof createFetchClient>
) {
  async function fetchAllMovements() {
    return await fetchClient.fetchJSON<MovementsResponse>("/api/v1/movements");
  }

  async function fetchAllPrograms() {
    return fetchClient.fetchJSON<FetchAllProgramsResponse>("/api/v1/programs");
  }

  async function fetchProgram(id: string) {
    const data = await fetchClient.fetchJSON<ProgramResponse>(
      `/api/v1/programs/${id}`
    );
    return data.program;
  }

  async function createProgram(program: CreateProgramRequest) {
    const data = await fetchClient.postJSON<ProgramResponse>(
      "/api/v1/programs",
      program
    );
    return data.program;
  }

  async function deleteProgram(id: string) {
    await fetchClient.deleteJSON(`/api/v1/programs/${id}`);
  }

  async function updateProgram(id: string, program: UpdateProgramRequest) {
    const data = await fetchClient.putJSON<ProgramResponse>(
      `/api/v1/programs/${id}`,
      program
    );
    return data.program;
  }

  return {
    fetchAllMovements,
    fetchAllPrograms,
    fetchProgram,
    createProgram,
    deleteProgram,
    updateProgram,
  };
}
