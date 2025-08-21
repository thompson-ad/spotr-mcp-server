import { z } from "zod";
import { deleteJSON, fetchJSON, postJSON, putJSON } from "./fetch.js";

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
  const data = await fetchJSON<MovementsResponse>("/api/v1/movements");
  return data.movements;
};

interface FetchAllProgramsResponse {
  programs: {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
  }[];
}

export const fetchAllPrograms = async () => {
  const data = await fetchJSON<FetchAllProgramsResponse>("/api/v1/programs");
  return data.programs;
};

interface ProgramExercise {
  id: string;
  order_index: number;
  exercise_name: string;
  video_url: string | null;
  notes: string | null;
  modifiable_parameters: Record<string, unknown> | null;
}

enum ProgramBlockFormatType {
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

interface ProgramResponse {
  program: {
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
  };
}

export const fetchProgram = async (id: string) => {
  const data = await fetchJSON<ProgramResponse>(`/api/v1/programs/${id}`);
  return data.program;
};

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

// Zod schemas for program creation
export const createProgramExerciseSchema = z
  .object({
    order_index: z.number(),
    exercise_name: z.string(),
    video_url: z.string().nullable(),
    notes: z.string().nullable(),
    modifiable_parameters: z.record(z.string(), z.unknown()).nullable(),
  })
  .describe(
    "Exercises are ordered by order_index and prescribe the movement. Movements can be modified in controlled ways by modifiable_parameters."
  );

export const createProgramBlockSchema = z
  .object({
    order_index: z.number(),
    name: z.string().nullable(),
    description: z.string().nullable(),
    format_type: z.nativeEnum(ProgramBlockFormatType).nullable(),
    format_parameters: z.record(z.string(), z.unknown()).nullable(),
    exercises: z.array(createProgramExerciseSchema),
  })
  .describe(
    "Training blocks are ordered by order_index and consist of exercises. Blocks are formatted by their format type and parameters."
  );

export const createProgramDaySchema = z
  .object({
    name: z.string().nullable(),
    description: z.string().nullable(),
    day_number: z.number(),
    blocks: z.array(createProgramBlockSchema),
  })
  .describe(
    "Training days are ordered by day_number and consist of logical blocks."
  );

export const createProgramSchema = z
  .object({
    name: z.string(),
    description: z.string().nullable(),
    days: z.array(createProgramDaySchema),
  })
  .describe("The users program - broken down into days, blocks and exercises");

export const createProgram = async (program: CreateProgramRequest) => {
  const data = await postJSON<ProgramResponse>("/api/v1/programs", program);
  return data.program;
};

export const deleteProgram = async (id: string) => {
  await deleteJSON(`/api/v1/programs/${id}`);
};

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

const updateProgramExerciseSchema = z
  .object({
    order_index: z.number(),
    exercise_name: z.string().optional(),
    video_url: z.string().optional(),
    notes: z.string().optional(),
    modifiable_parameters: z.record(z.string(), z.unknown()).optional(),
  })
  .describe(
    "Exercises are ordered by order_index and prescribe the movement. Movements can be modified in controlled ways by modifiable_parameters."
  );

const updateProgramBlockSchema = z
  .object({
    order_index: z.number(),
    name: z.string().optional(),
    description: z.string().optional(),
    format_type: z.nativeEnum(ProgramBlockFormatType).optional(),
    format_parameters: z.record(z.string(), z.unknown()).optional(),
    exercises: z.array(updateProgramExerciseSchema).optional(),
  })
  .describe(
    "Training blocks are ordered by order_index and consist of exercises. Blocks are formatted by their format type and parameters."
  );

const updateProgramDaySchema = z
  .object({
    day_number: z.number(),
    name: z.string().optional(),
    description: z.string().optional(),
    blocks: z.array(updateProgramBlockSchema).optional(),
  })
  .describe(
    "Training days are ordered by day_number and consist of logical blocks."
  );

export const updateProgramSchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    days: z.array(updateProgramDaySchema).optional(),
  })
  .describe("The users program - broken down into days, blocks and exercises");

export const updateProgram = async (
  id: string,
  program: UpdateProgramRequest
) => {
  const data = await putJSON<ProgramResponse>(
    `/api/v1/programs/${id}`,
    program
  );
  return data.program;
};
