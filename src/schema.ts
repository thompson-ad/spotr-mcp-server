import z from "zod";
import { ProgramBlockFormatType } from "./api.js";

// UPDATE
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

// CREATE
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

// FETCH

export const fetchAllMovementsSchema = z.object({
  movements: z.record(
    z.string(),
    z.array(
      z.object({
        name: z.string(),
        variation: z.string(),
        client_demo: z.string(),
      })
    )
  ),
});

export const fetchAllProgramsSchema = z.object({
  programs: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        created_at: z.string(),
        updated_at: z.string(),
      })
    )
    .describe(
      `An array of all the users programs. Top level data only, excludes program detail`
    ),
});

// Response schemas for program operations
const programExerciseResponseSchema = z.object({
  id: z.string(),
  order_index: z.number(),
  exercise_name: z.string(),
  video_url: z.string().nullable(),
  notes: z.string().nullable(),
  modifiable_parameters: z.record(z.string(), z.unknown()).nullable(),
});

const programBlockResponseSchema = z.object({
  id: z.string(),
  order_index: z.number(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  format_type: z.nativeEnum(ProgramBlockFormatType).nullable(),
  format_parameters: z.record(z.string(), z.unknown()).nullable(),
  exercises: z.array(programExerciseResponseSchema),
});

const programDayResponseSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  day_number: z.number(),
  blocks: z.array(programBlockResponseSchema),
});

export const programResponseSchema = z.object({
  id: z.string(),
  coach_id: z.string(),
  member_id: z.string(),
  tenant_id: z.string(),
  organization_id: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  days: z.array(programDayResponseSchema),
  created_at: z.string(),
  updated_at: z.string(),
});

export const deleteProgramResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
