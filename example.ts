/**
 * Spotr MCP Server Implementation
 * 
 * This server provides tools, resources, and prompts for the Spotr fitness platform,
 * enabling Claude to generate workout programs, blueprints, and analyses.
 */
import 'dotenv/config'
import {
    McpServer,
  } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

import fs from "fs";
import path from "path";

// API configuration
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api";
const API_KEY = process.env.API_KEY || "test-key";
const WEB_APP_URL = process.env.WEB_APP_URL || "http://localhost:3000";

// Create an MCP server
const server = new McpServer({
  name: "SpotrFitnessServer",
  version: "1.0.0",
});

// Helper for mock data during development
const MOCK_MODE = process.env.MOCK_MODE === "true";
const MOCK_DATA_DIR = path.join(process.cwd(), "mock-data");

// Ensure mock data directory exists if in mock mode
if (MOCK_MODE && !fs.existsSync(MOCK_DATA_DIR)) {
  fs.mkdirSync(MOCK_DATA_DIR, { recursive: true });
  
  // Create initial mock data files with empty arrays/objects
  const initialMockData = {
    coaches: [],
    clients: [],
    programs: [],
    blueprints: [],
    exercises: [],
    analyses: [],
    evaluations: []
  };
  
  Object.entries(initialMockData).forEach(([filename, data]) => {
    fs.writeFileSync(
      path.join(MOCK_DATA_DIR, `${filename}.json`),
      JSON.stringify(data, null, 2)
    );
  });
}

// API Helper Functions
const api = {
  // Coach operations
  async getCoach(coachId: string) {
    if (MOCK_MODE) {
      try {
        const coaches = JSON.parse(fs.readFileSync(path.join(MOCK_DATA_DIR, "coaches.json"), "utf-8"));
        return coaches.find((c: any) => c.id === coachId);
      } catch (error) {
        console.error("Error reading mock coach data:", error);
        return null;
      }
    }
    
    const response = await axios.get(`${API_BASE_URL}/coaches/${coachId}`, {
      headers: { "X-API-Key": API_KEY }
    });
    return response.data;
  },
  
  async getCoachStyle(coachId: string) {
    if (MOCK_MODE) {
      try {
        const coaches = JSON.parse(fs.readFileSync(path.join(MOCK_DATA_DIR, "coaches.json"), "utf-8"));
        const coach = coaches.find((c: any) => c.id === coachId);
        return coach?.style || null;
      } catch (error) {
        console.error("Error reading mock coach style data:", error);
        return null;
      }
    }
    
    const response = await axios.get(`${API_BASE_URL}/coaches/${coachId}/style`, {
      headers: { "X-API-Key": API_KEY }
    });
    return response.data;
  },
  
  // Client operations
  async getClient(clientId: string) {
    if (MOCK_MODE) {
      try {
        const clients = JSON.parse(fs.readFileSync(path.join(MOCK_DATA_DIR, "clients.json"), "utf-8"));
        return clients.find((c: any) => c.id === clientId);
      } catch (error) {
        console.error("Error reading mock client data:", error);
        return null;
      }
    }
    
    const response = await axios.get(`${API_BASE_URL}/clients/${clientId}`, {
      headers: { "X-API-Key": API_KEY }
    });
    return response.data;
  },
  
  async getClientProgress(clientId: string, programId: string) {
    if (MOCK_MODE) {
      try {
        const analyses = JSON.parse(fs.readFileSync(path.join(MOCK_DATA_DIR, "analyses.json"), "utf-8"));
        return analyses.find((a: any) => a.clientId === clientId && a.programId === programId);
      } catch (error) {
        console.error("Error reading mock client progress data:", error);
        return null;
      }
    }
    
    const response = await axios.get(`${API_BASE_URL}/clients/${clientId}/programs/${programId}/progress`, {
      headers: { "X-API-Key": API_KEY }
    });
    return response.data;
  },
  
  // Program operations
  async getProgram(programId: string) {
    if (MOCK_MODE) {
      try {
        const programs = JSON.parse(fs.readFileSync(path.join(MOCK_DATA_DIR, "programs.json"), "utf-8"));
        return programs.find((p: any) => p.id === programId);
      } catch (error) {
        console.error("Error reading mock program data:", error);
        return null;
      }
    }
    
    const response = await axios.get(`${API_BASE_URL}/programs/${programId}`, {
      headers: { "X-API-Key": API_KEY }
    });
    return response.data;
  },
  
  async storeProgram(programData: any) {
    if (MOCK_MODE) {
      try {
        const programs = JSON.parse(fs.readFileSync(path.join(MOCK_DATA_DIR, "programs.json"), "utf-8"));
        const newProgram = {
          id: `program-${Date.now()}`,
          ...programData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        programs.push(newProgram);
        fs.writeFileSync(
          path.join(MOCK_DATA_DIR, "programs.json"),
          JSON.stringify(programs, null, 2)
        );
        return newProgram;
      } catch (error) {
        console.error("Error storing mock program data:", error);
        throw error;
      }
    }
    
    const response = await axios.post(`${API_BASE_URL}/programs`, programData, {
      headers: { "X-API-Key": API_KEY }
    });
    return response.data;
  },
  
  async updateProgram(programId: string, updates: any) {
    if (MOCK_MODE) {
      try {
        const programs = JSON.parse(fs.readFileSync(path.join(MOCK_DATA_DIR, "programs.json"), "utf-8"));
        const programIndex = programs.findIndex((p: any) => p.id === programId);
        
        if (programIndex === -1) {
          throw new Error(`Program with ID ${programId} not found`);
        }
        
        const updatedProgram = {
          ...programs[programIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        programs[programIndex] = updatedProgram;
        
        fs.writeFileSync(
          path.join(MOCK_DATA_DIR, "programs.json"),
          JSON.stringify(programs, null, 2)
        );
        
        return updatedProgram;
      } catch (error) {
        console.error("Error updating mock program data:", error);
        throw error;
      }
    }
    
    const response = await axios.patch(`${API_BASE_URL}/programs/${programId}`, updates, {
      headers: { "X-API-Key": API_KEY }
    });
    return response.data;
  },
  
  // Blueprint operations
  async getBlueprint(blueprintId: string) {
    if (MOCK_MODE) {
      try {
        const blueprints = JSON.parse(fs.readFileSync(path.join(MOCK_DATA_DIR, "blueprints.json"), "utf-8"));
        return blueprints.find((b: any) => b.id === blueprintId);
      } catch (error) {
        console.error("Error reading mock blueprint data:", error);
        return null;
      }
    }
    
    const response = await axios.get(`${API_BASE_URL}/blueprints/${blueprintId}`, {
      headers: { "X-API-Key": API_KEY }
    });
    return response.data;
  },
  
  async storeBlueprint(blueprintData: any) {
    if (MOCK_MODE) {
      try {
        const blueprints = JSON.parse(fs.readFileSync(path.join(MOCK_DATA_DIR, "blueprints.json"), "utf-8"));
        const newBlueprint = {
          id: `blueprint-${Date.now()}`,
          ...blueprintData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        blueprints.push(newBlueprint);
        fs.writeFileSync(
          path.join(MOCK_DATA_DIR, "blueprints.json"),
          JSON.stringify(blueprints, null, 2)
        );
        return newBlueprint;
      } catch (error) {
        console.error("Error storing mock blueprint data:", error);
        throw error;
      }
    }
    
    const response = await axios.post(`${API_BASE_URL}/blueprints`, blueprintData, {
      headers: { "X-API-Key": API_KEY }
    });
    return response.data;
  },
  
  // Exercise operations
  async getExercises() {
    if (MOCK_MODE) {
      try {
        return JSON.parse(fs.readFileSync(path.join(MOCK_DATA_DIR, "exercises.json"), "utf-8"));
      } catch (error) {
        console.error("Error reading mock exercise data:", error);
        return [];
      }
    }
    
    const response = await axios.get(`${API_BASE_URL}/exercises`, {
      headers: { "X-API-Key": API_KEY }
    });
    return response.data;
  },
  
  async searchExercises(criteria: any) {
    if (MOCK_MODE) {
      try {
        const exercises = JSON.parse(fs.readFileSync(path.join(MOCK_DATA_DIR, "exercises.json"), "utf-8"));
        
        // Very basic filtering for mock mode
        return exercises.filter((ex: any) => {
          if (criteria.muscleGroup && ex.primaryMuscleGroup !== criteria.muscleGroup) return false;
          if (criteria.equipment && !ex.equipment.includes(criteria.equipment)) return false;
          if (criteria.difficulty && ex.difficultyLevel !== criteria.difficulty) return false;
          return true;
        }).slice(0, criteria.limit || 100);
      } catch (error) {
        console.error("Error searching mock exercise data:", error);
        return [];
      }
    }
    
    const response = await axios.get(`${API_BASE_URL}/exercises/search`, {
      params: criteria,
      headers: { "X-API-Key": API_KEY }
    });
    return response.data;
  },
  
  // Progress analysis operations
  async storeProgressAnalysis(analysisData: any) {
    if (MOCK_MODE) {
      try {
        const analyses = JSON.parse(fs.readFileSync(path.join(MOCK_DATA_DIR, "analyses.json"), "utf-8"));
        const newAnalysis = {
          id: `analysis-${Date.now()}`,
          ...analysisData,
          createdAt: new Date().toISOString()
        };
        analyses.push(newAnalysis);
        fs.writeFileSync(
          path.join(MOCK_DATA_DIR, "analyses.json"),
          JSON.stringify(analyses, null, 2)
        );
        return newAnalysis;
      } catch (error) {
        console.error("Error storing mock analysis data:", error);
        throw error;
      }
    }
    
    const response = await axios.post(
      `${API_BASE_URL}/clients/${analysisData.clientId}/programs/${analysisData.programId}/analysis`,
      analysisData,
      {
    description: `
      Stores a workout blueprint created by a coach in the Spotr database.
      
      A blueprint is a template that can be used to generate personalized programs for multiple clients.
      Unlike a program, a blueprint is more general and doesn't contain client-specific details.
      
      EXAMPLE USAGE:
      ```
      // Example: Storing a strength training blueprint
      store-blueprint({
        coachId: "coach-123",
        blueprintName: "Intermediate Upper Body Strength",
        targetAudience: "Intermediate lifters focusing on upper body development",
        durationWeeks: 8,
        sessionsPerWeek: 4,
        fitnessGoal: "Strength",
        equipmentLevel: "Full Gym",
        description: "An 8-week upper body strength blueprint for intermediate lifters with full gym access",
        phases: [
          {
            name: "Accumulation Phase",
            weeks: 3,
            description: "Focus on building volume with moderate intensity",
            sessionTemplates: [
              {
                name: "Push Day Template",
                description: "Focuses on chest, shoulders, and triceps",
                exerciseCategories: [
                  {
                    category: "Compound Upper Push",
                    setRange: "4-5",
                    repRange: "8-10",
                    intensityGuideline: "70-75% 1RM"
                  },
                  // More categories...
                ]
              },
              // More session templates...
            ]
          },
          // More phases...
        ]
      })
      ```
      
      WHEN TO USE:
      Use this tool when you've created a generalized workout blueprint that a coach can use for multiple clients.
      If you're creating a program for a specific client, use the store-program tool instead.
    `
  }
);

// Create program from blueprint tool
server.tool(
  "create-program-from-blueprint",
  {
    blueprintId: z.string().describe("ID of the blueprint to base the program on. Example: 'blueprint-123'"),
    clientId: z.string().describe("ID of the client receiving the program. Example: 'client-456'"),
    programName: z.string().describe("Name for the new program. Example: 'Sarah's Upper Body Program'"),
    startDate: z.string().optional().describe("Optional start date in YYYY-MM-DD format. Example: '2025-03-15'"),
    
    // Client-specific customizations
    customizations: z.object({
      exerciseSubstitutions: z.array(
        z.object({
          category: z.string().describe("Exercise category from the blueprint"),
          exerciseName: z.string().describe("Specific exercise name to use for this client")
        })
      ).optional().describe("Optional exercise substitutions based on client needs"),
      
      intensityAdjustments: z.string().optional().describe("Adjustments to intensity based on client's level"),
      
      frequencyAdjustments: z.string().optional().describe("Adjustments to training frequency"),
      
      progressionAdjustments: z.string().optional().describe("Adjustments to progression strategy"),
      
      notes: z.string().optional().describe("Additional notes about the customizations")
    }).optional().describe("Optional client-specific customizations")
  },
  async (params) => {
    try {
      // First, get the blueprint
      const blueprint = await api.getBlueprint(params.blueprintId);
      if (!blueprint) {
        return {
          isError: true,
          content: [{
            type: "text",
            text: `Error: Blueprint with ID "${params.blueprintId}" not found.`
          }]
        };
      }
      
      // Get the client
      const client = await api.getClient(params.clientId);
      if (!client) {
        return {
          isError: true,
          content: [{
            type: "text",
            text: `Error: Client with ID "${params.clientId}" not found.`
          }]
        };
      }
      
      // In a real implementation, we would convert the blueprint to a program
      // with client-specific customizations here. For now, we'll create a mock program.
      const programData = {
        coachId: blueprint.coachId,
        clientId: params.clientId,
        blueprintId: params.blueprintId,
        programName: params.programName,
        durationWeeks: blueprint.durationWeeks,
        sessionsPerWeek: blueprint.sessionsPerWeek,
        primaryGoal: blueprint.fitnessGoal,
        description: `Personalized from "${blueprint.blueprintName}" blueprint for ${client.name}`,
        startDate: params.startDate || new Date().toISOString().split('T')[0],
        // Simplified phases conversion for this mock implementation
        phases: blueprint.phases.map(phase => ({
          name: phase.name,
          weeks: phase.weeks,
          description: phase.description,
          sessions: [] // In a real implementation, this would convert session templates to actual sessions
        })),
        customizationNotes: params.customizations?.notes || "Standard implementation of blueprint"
      };
      
      // Store the program
      const result = await api.storeProgram(programData);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            message: "Program successfully created from blueprint",
            programId: result.id,
            programUrl: `${WEB_APP_URL}/programs/${result.id}`,
            blueprintId: params.blueprintId,
            clientId: params.clientId,
            programName: params.programName
          }, null, 2)
        }]
      };
    } catch (error: any) {
      console.error("Error creating program from blueprint:", error);
      
      // Create helpful error message
      let errorMessage = `Error creating program from blueprint: ${error.message}`;
      let troubleshooting = [
        "Check that the blueprint ID is correct",
        "Ensure the client ID is valid",
        "Verify that the coach has permission to create programs for this client"
      ];
      
      return {
        isError: true,
        content: [{
          type: "text",
          text: `${errorMessage}\n\nTroubleshooting steps:\n- ${troubleshooting.join('\n- ')}`
        }]
      };
    }
  },
  {
    description: `
      Creates a personalized program for a specific client based on a blueprint.
      
      This tool takes a blueprint (general template) and customizes it for a specific client,
      considering their individual needs, preferences, and constraints.
      
      EXAMPLE USAGE:
      ```
      // Example: Creating a program from a blueprint
      create-program-from-blueprint({
        blueprintId: "blueprint-123",
        clientId: "client-456",
        programName: "Sarah's 8-Week Strength Program",
        startDate: "2025-03-15",
        customizations: {
          exerciseSubstitutions: [
            {
              category: "Compound Upper Push",
              exerciseName: "Incline Dumbbell Press"
            }
          ],
          intensityAdjustments: "Reduce initial intensity by 10% due to client's recent return from break",
          notes: "Client has slight shoulder discomfort with overhead pressing movements"
        }
      })
      ```
      
      WHEN TO USE:
      Use this tool when you need to create a personalized program for a client based on an existing blueprint.
      This is preferable to creating a program from scratch when there's already a suitable blueprint available.
    `
  }
);

// Update program tool
server.tool(
  "update-program",
  {
    programId: z.string().describe("ID of the program to update. Example: 'program-123'"),
    updates: z.object({
      programName: z.string().optional().describe("New name for the program"),
      description: z.string().optional().describe("Updated program description"),
      
      // Can update specific phase
      phaseUpdates: z.array(
        z.object({
          phaseIndex: z.number().describe("Index of the phase to update (0-based)"),
          name: z.string().optional().describe("New name for the phase"),
          description: z.string().optional().describe("Updated phase description"),
          notes: z.string().optional().describe("Updated notes for the phase"),
          
          // Can update specific session within the phase
          sessionUpdates: z.array(
            z.object({
              sessionIndex: z.number().describe("Index of the session to update (0-based)"),
              name: z.string().optional().describe("New name for the session"),
              notes: z.string().optional().describe("Updated notes for the session"),
              
              // Can update specific exercise within the session
              exerciseUpdates: z.array(
                z.object({
                  exerciseIndex: z.number().describe("Index of the exercise to update (0-based)"),
                  name: z.string().optional().describe("New exercise name"),
                  sets: z.number().optional().describe("Updated number of sets"),
                  reps: z.string().optional().describe("Updated rep scheme"),
                  weight: z.string().optional().describe("Updated weight/intensity guideline"),
                  restPeriod: z.string().optional().describe("Updated rest period"),
                  notes: z.string().optional().describe("Updated notes for the exercise")
                })
              ).optional().describe("Optional updates to specific exercises")
            })
          ).optional().describe("Optional updates to specific sessions")
        })
      ).optional().describe("Optional updates to specific phases"),
      
      // General program notes
      notes: z.string().optional().describe("Updated general notes for the program"),
      
      // Modification reason for tracking
      modificationReason: z.string().describe("Reason for the modifications. Example: 'Adjusting based on client feedback'")
    }).refine(data => {
      // Ensure at least one update field is provided
      return Object.keys(data).some(key => key !== 'modificationReason' && data[key as keyof typeof data] !== undefined);
    }, {
      message: "At least one update field must be provided"
    }).describe("Updates to apply to the program")
  },
  async (params) => {
    try {
      // In a real implementation, we would selectively update only the specified parts
      // of the program. For now, we'll do a simplified update.
      
      // First, get the current program
      const currentProgram = await api.getProgram(params.programId);
      if (!currentProgram) {
        return {
          isError: true,
          content: [{
            type: "text",
            text: `Error: Program with ID "${params.programId}" not found.`
          }]
        };
      }
      
      // Apply updates (simplified for mock implementation)
      const updates = {
        ...params.updates,
        updatedAt: new Date().toISOString(),
        modificationHistory: [
          ...(currentProgram.modificationHistory || []),
          {
            date: new Date().toISOString(),
            reason: params.updates.modificationReason,
            changes: Object.keys(params.updates)
              .filter(key => key !== 'modificationReason')
              .join(', ')
          }
        ]
      };
      
      // Update the program
      const result = await api.updateProgram(params.programId, updates);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            message: "Program successfully updated",
            programId: params.programId,
            programUrl: `${WEB_APP_URL}/programs/${params.programId}`,
            updatedFields: Object.keys(params.updates)
              .filter(key => key !== 'modificationReason')
              .join(', '),
            modificationReason: params.updates.modificationReason
          }, null, 2)
        }]
      };
    } catch (error: any) {
      console.error("Error updating program:", error);
      return {
        isError: true,
        content: [{
          type: "text",
          text: `Error updating program: ${error.message}\n\nPlease check that the program ID is correct and you have permission to update this program.`
        }]
      };
    }
  },
  {
    description: `
      Updates an existing workout program with new information or adjustments.
      
      This tool allows for selective updates to specific parts of a program without
      having to replace the entire program. This is useful for making adjustments
      based on client feedback or progress.
      
      EXAMPLE USAGE:
      ```
      // Example: Updating specific exercise parameters
      update-program({
        programId: "program-123",
        updates: {
          phaseUpdates: [
            {
              phaseIndex: 0,
              sessionUpdates: [
                {
                  sessionIndex: 1,
                  exerciseUpdates: [
                    {
                      exerciseIndex: 2,
                      sets: 4,
                      reps: "6-8",
                      notes: "Focus on slow, controlled eccentric"
                    }
                  ]
                }
              ]
            }
          ],
          modificationReason: "Adjusting based on client feedback about recovery capacity"
        }
      })
      ```
      
      WHEN TO USE:
      Use this tool when you need to make adjustments to an existing program rather than
      creating a new one. This is ideal for ongoing program maintenance and progressive adjustments.
    `
  }
);

// Store progress analysis tool
server.tool(
  "store-progress-analysis",
  {
    clientId: z.string().describe("ID of the client whose progress is being analyzed. Example: 'client-123'"),
    programId: z.string().describe("ID of the program being analyzed. Example: 'program-456'"),
    
    // Use enum to prevent errors
    timeframe: z.enum(["1_week", "2_weeks", "4_weeks", "8_weeks", "entire_program"])
      .describe("Timeframe for the analysis. Example: '4_weeks' for a monthly analysis"),
    
    // Strength progress
    strengthProgress: z.array(
      z.object({
        exerciseName: z.string().describe("Name of the exercise being analyzed"),
        initialPerformance: z.string().describe("Performance at the start of the timeframe. Example: '100kg × 5 reps'"),
        currentPerformance: z.string().describe("Performance at the end of the timeframe. Example: '110kg × 5 reps'"),
        percentageImprovement: z.number().optional().describe("Percentage improvement, if calculable"),
        recommendation: z.string().describe("Recommendation for this exercise going forward")
      })
    ).min(1).describe("Analysis of strength progress for key exercises"),
    
    // Body composition (optional but structured)
    bodyCompositionChanges: z.array(
      z.object({
        metric: z.enum(["weight", "body_fat", "chest", "waist", "hips", "arms", "legs", "other"])
          .describe("Body composition metric being tracked"),
        initialValue: z.number().describe("Value at the start of the timeframe"),
        currentValue: z.number().describe("Value at the end of the timeframe"),
        unit: z.string().describe("Unit of measurement. Example: 'kg', 'cm', '%'"),
        change: z.number().describe("Numeric change (positive or negative)"),
        assessment: z.string().describe("Assessment of this change relative to goals")
      })
    ).optional().describe("Analysis of body composition changes, if relevant"),
    
    // Adherence
    adherence: z.object({
      plannedSessions: z.number().describe("Number of sessions planned in this timeframe"),
      completedSessions: z.number().describe("Number of sessions actually completed"),
      adherenceRate: z.number().min(0).max(100).describe("Adherence percentage (completedSessions/plannedSessions × 100)"),
      factors: z.array(z.string()).optional().describe("Factors affecting adherence, if known")
    }).describe("Analysis of client's adherence to the program"),
    
    // Overall assessment and recommendations
    overallAssessment: z.string().describe("Overall assessment of the client's progress in 2-3 paragraphs"),
    
    actionableRecommendations: z.array(z.string()).min(1).max(5)
      .describe("1-5 specific, actionable recommendations for the client going forward")
  },
  async (params) => {
    try {
      // Store the progress analysis
      const analysisData = {
        ...params,
        createdAt: new Date().toISOString()
      };
      
      const result = await api.storeProgressAnalysis(analysisData);
      
      return {
        content: [{
          type: "text",
          text: `Progress analysis successfully stored!

Analysis ID: ${result.id}
Client ID: ${params.clientId}
Program ID: ${params.programId}
Timeframe: ${formatTimeframe(params.timeframe)}
Created: ${new Date().toLocaleDateString()}

Key findings:
- Overall adherence rate: ${params.adherence.adherenceRate}%
- Top strength improvement: ${findTopImprovement(params.strengthProgress)}
${params.bodyCompositionChanges ? `- Body composition: ${summarizeBodyComp(params.bodyCompositionChanges)}` : ''}

You can view the full analysis here: ${WEB_APP_URL}/analysis/${result.id}

The client can now be notified about their progress analysis.`
        }]
      };
    } catch (error: any) {
      console.error("Error storing progress analysis:", error);
      return {
        isError: true,
        content: [{
          type: "text",
          text: `Error storing progress analysis: ${error.message}

Common causes for this error:
1. Client ID or Program ID may be incorrect
2. Missing required fields in the analysis
3. Timeframe format might be incorrect (use one of: 1_week, 2_weeks, 4_weeks, 8_weeks, entire_program)
4. Server connection issue

Please check your input and try again.`
        }]
      };
    }
  },
  {
    description: `
      Stores a client progress analysis in the Spotr database.
      
      This tool allows you to record and track a client's progress over time,
      including strength gains, body composition changes, and adherence to the program.
      
      EXAMPLE USAGE:
      ```
      // Example: Storing a 4-week progress analysis
      store-progress-analysis({
        clientId: "client-123",
        programId: "program-456",
        timeframe: "4_weeks",
        strengthProgress: [
          {
            exerciseName: "Barbell Bench Press",
            initialPerformance: "60kg × 5 reps",
            currentPerformance: "70kg × 5 reps",
            percentageImprovement: 16.7,
            recommendation: "Continue linear progression, aim for 75kg next month"
          },
          {
            exerciseName: "Pull-ups",
            initialPerformance: "BW × 5 reps",
            currentPerformance: "BW × 8 reps",
            percentageImprovement: 60,
            recommendation: "Begin adding weight once client can perform 12 reps"
          }
        ],
        bodyCompositionChanges: [
          {
            metric: "weight",
            initialValue: 70,
            currentValue: 71.5,
            unit: "kg",
            change: 1.5,
            assessment: "Slight weight gain as expected for muscle building phase"
          }
        ],
        adherence: {
          plannedSessions: 16,
          completedSessions: 15,
          adherenceRate: 93.75,
          factors: ["Missed one session due to illness"]
        },
        overallAssessment: "Sarah has made excellent progress in her first month...",
        actionableRecommendations: [
          "Increase bench press weight by 2.5kg per week",
          "Add one additional set to pull-ups",
          "Consider increasing protein intake slightly to support recovery"
        ]
      })
      ```
      
      WHEN TO USE:
      Use this tool when you need to document and store a formal analysis of a client's
      progress for a specific timeframe within their program.
    `
  }
);

// Evaluate program or blueprint tool
server.tool(
  "evaluate-program",
  {
    entityType: z.enum(["program", "blueprint"]).describe("Type of entity to evaluate"),
    entityId: z.string().describe("ID of the program or blueprint to evaluate. Example: 'program-123'"),
    evaluationPurpose: z.enum([
      "client_suitability",
      "general_quality",
      "scientific_validity",
      "coach_review",
      "peer_review"
    ]).describe("Purpose of the evaluation. Example: 'client_suitability'"),
    
    clientId: z.string().optional().describe("ID of the client, if evaluating suitability for a specific client"),
    
    // Numerical scores for different aspects
    scores: z.object({
      overall: z.number().min(0).max(100).describe("Overall score from 0-100"),
      
      structureAndProgression: z.number().min(0).max(100)
        .describe("Score for program structure and progression strategy"),
      
      exerciseSelection: z.number().min(0).max(100)
        .describe("Score for exercise selection and balance"),
      
      volumeAndIntensity: z.number().min(0).max(100)
        .describe("Score for appropriate volume and intensity"),
      
      recovery: z.number().min(0).max(100)
        .describe("Score for recovery management"),
      
      specificity: z.number().min(0).max(100)
        .describe("Score for specificity to stated goals"),
      
      practicality: z.number().min(0).max(100)
        .describe("Score for practicality and feasibility")
    }).describe("Scores for different aspects of the program/blueprint"),
    
    // Qualitative assessments
    strengths: z.array(z.string()).min(1).describe("Key strengths of the program/blueprint"),
    
    weaknesses: z.array(z.string()).describe("Areas that could be improved"),
    
    improvementSuggestions: z.array(z.string()).describe("Specific suggestions for improvement"),
    
    // If evaluating for a client
    suitabilityConclusion: z.string().optional()
      .describe("Conclusion about suitability for the client (only if clientId provided)")
  },
  async (params) => {
    try {
      // Store the evaluation
      const evaluationData = {
        ...params,
        createdAt: new Date().toISOString()
      };
      
      const result = await api.storeEvaluation(evaluationData);
      
      // Create a formatted response
      const entityTypeCapitalized = params.entityType.charAt(0).toUpperCase() + params.entityType.slice(1);
      
      return {
        content: [{
          type: "text",
          text: `${entityTypeCapitalized} Evaluation Completed

Evaluation ID: ${result.id}
Entity: ${params.entityType} (ID: ${params.entityId})
Purpose: ${params.evaluationPurpose.replace('_', ' ')}
${params.clientId ? `Client: ${params.clientId}` : ''}
Date: ${new Date().toLocaleDateString()}

Overall Score: ${params.scores.overall}/100 (${scoreToRating(params.scores.overall)})

Component Scores:
- Structure & Progression: ${params.scores.structureAndProgression}/100
- Exercise Selection: ${params.scores.exerciseSelection}/100
- Volume & Intensity: ${params.scores.volumeAndIntensity}/100
- Recovery Management: ${params.scores.recovery}/100
- Specificity to Goals: ${params.scores.specificity}/100
- Practicality: ${params.scores.practicality}/100

Key Strengths:
${params.strengths.map(s => `- ${s}`).join('\n')}

Areas for Improvement:
${params.weaknesses.map(w => `- ${w}`).join('\n')}

Improvement Suggestions:
${params.improvementSuggestions.map(s => `- ${s}`).join('\n')}

${params.suitabilityConclusion ? `Suitability Conclusion:\n${params.suitabilityConclusion}` : ''}

You can view the full evaluation here: ${WEB_APP_URL}/evaluations/${result.id}`
        }]
      };
    } catch (error: any) {
      console.error("Error storing evaluation:", error);
      return {
        isError: true,
        content: [{
          type: "text",
          text: `Error storing evaluation: ${error.message}

Please check:
1. The entity type and ID are correct
2. All required fields are properly formatted
3. Scores are between 0-100
4. The client ID is valid (if provided)`
        }]
      };
    }
  },
  {
    description: `
      Evaluates a workout program or blueprint against best practices and scientific principles.
      
      WHEN TO USE:
      - Use when asked to assess the quality or effectiveness of a program or blueprint
      - Use when comparing multiple program approaches
      - Use when checking if a program aligns with a client's goals
      
      DO NOT USE:
      - If you need to create a new program (use store-program instead)
      - If you need to analyze client progress (use store-progress-analysis instead)
      - If you need to modify an existing program (use update-program instead)
      
      EXAMPLE USAGE:
      ```
      // Example of evaluating a strength program
      evaluate-program({
        entityType: "program",
        entityId: "program-123",
        evaluationPurpose: "client_suitability",
        clientId: "client-456",
        scores: {
          overall: 85,
          structureAndProgression: 90,
          exerciseSelection: 85,
          volumeAndIntensity: 80,
          recovery: 75,
          specificity: 90,
          practicality: 85
        },
        strengths: [
          "Excellent progression strategy",
          "Good balance of compound movements",
          "Appropriate volume for an intermediate lifter"
        ],
        weaknesses: [
          "Limited shoulder mobility work",
          "Recovery between leg sessions could be improved"
        ],
        improvementSuggestions: [
          "Add dedicated mobility work before upper body sessions",
          "Consider spacing leg sessions further apart"
        ],
        suitabilityConclusion: "This program is well-suited for this client's goals and experience level, with minor modifications needed for their shoulder mobility issues."
      })
      ```
    `
  }
);

// Generate share link tool
server.tool(
  "generate-share-link",
  {
    entityType: z.enum(["program", "blueprint", "analysis", "evaluation"])
      .describe("Type of content to share. Example: 'program'"),
    entityId: z.string().describe("ID of the entity to share. Example: 'program-123'"),
    expiresInDays: z.number().min(1).max(365).optional().default(30)
      .describe("Number of days until the link expires. Default is 30 days.")
  },
  async (params) => {
    try {
      // Generate a share link
      const result = await api.generateShareLink(params);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            shareUrl: result.shareUrl,
            accessCode: result.accessCode,
            expiresAt: result.expiresAt,
            entityType: params.entityType,
            entityId: params.entityId
          }, null, 2)
        }]
      };
    } catch (error: any) {
      console.error("Error generating share link:", error);
      return {
        isError: true,
        content: [{
          type: "text",
          text: `Error generating share link: ${error.message}

Please check:
1. The entity type and ID are correct
2. You have permission to share this content
3. The entity exists in the database`
        }]
      };
    }
  },
  {
    description: `
      Generates a shareable link for a program, blueprint, analysis, or evaluation.
      
      This tool creates a time-limited link that can be shared with clients or other coaches,
      allowing them to access the content without needing to log in to the Spotr platform.
      
      EXAMPLE USAGE:
      ```
      // Example: Generating a share link for a program
      generate-share-link({
        entityType: "program",
        entityId: "program-123",
        expiresInDays: 14
      })
      ```
      
      WHEN TO USE:
      Use this tool when you need to create a link that can be shared with a client or
      other coach to give them access to view a program, blueprint, analysis, or evaluation.
    `
  }
);

// Search exercises tool
server.tool(
  "search-exercises",
  {
    query: z.string().optional().describe("Search term for exercise name. Example: 'bench press'"),
    muscleGroup: z.string().optional().describe("Primary muscle group to target. Example: 'chest', 'back', 'legs'"),
    equipment: z.string().optional().describe("Equipment required. Example: 'barbell', 'dumbbell', 'bodyweight'"),
    difficulty: z.string().optional().describe("Exercise difficulty level. Example: 'beginner', 'intermediate', 'advanced'"),
    movementPattern: z.string().optional().describe("Movement pattern. Example: 'push', 'pull', 'hinge', 'squat'"),
    limit: z.number().min(1).max(100).optional().default(20).describe("Maximum number of results to return. Default is 20.")
  },
  async (params) => {
    try {
      // Search exercises
      const exercises = await api.searchExercises(params);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            count: exercises.length,
            exercises: exercises.map((ex: any) => ({
              id: ex.id,
              name: ex.name,
              primaryMuscleGroup: ex.primaryMuscleGroup,
              equipment: ex.equipment,
              difficulty: ex.difficultyLevel,
              ...(ex.videoUrl ? { videoUrl: ex.videoUrl } : {})
            }))
          }, null, 2)
        }]
      };
    } catch (error: any) {
      console.error("Error searching exercises:", error);
      return {
        isError: true,
        content: [{
          type: "text",
          text: `Error searching exercises: ${error.message}

Please check that your search criteria are valid and properly formatted.`
        }]
      };
    }
  },
  {
    description: `
      Searches the exercise library based on various criteria.
      
      This tool helps you find appropriate exercises for a program based on
      muscle groups, equipment availability, difficulty level, and more.
      
      EXAMPLE USAGE:
      ```
      // Example: Finding chest exercises for beginners with dumbbells
      search-exercises({
        muscleGroup: "chest",
        equipment: "dumbbell",
        difficulty: "beginner",
        limit: 5
      })
      ```
      
      WHEN TO USE:
      Use this tool when you need to find appropriate exercises to include in a program,
      or when you need to suggest exercise alternatives based on specific criteria.
    `
  }
);

// ========================
// PROMPTS
// ========================

// Generate program prompt
server.prompt(
  "generate-program-prompt",
  {
    coachId: z.string().describe("ID of the coach who will create the program"),
    coachName: z.string().describe("Name of the coach"),
    clientId: z.string().describe("ID of the client who will follow the program"),
    clientName: z.string().describe("Name of the client"),
    programGoal: z.string().describe("Primary fitness goal for the program"),
    durationWeeks: z.number().min(1).max(52).describe("Program duration in weeks"),
    sessionsPerWeek: z.number().min(1).max(7).describe("Sessions per week"),
    equipmentAvailability: z.string().describe("Available equipment")
  },
  (params) => {
    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Please create a fitness program for ${params.clientName} based on Coach ${params.coachName}'s style and approach. This program should focus on ${params.programGoal}, last for ${params.durationWeeks} weeks with ${params.sessionsPerWeek} sessions per week, and be designed for someone with access to ${params.equipmentAvailability} equipment.

You can access Coach ${params.coachName}'s profile and training style at coach://${params.coachId}/profile and coach://${params.coachId}/style to understand their coaching philosophy and programming approach.

You can also access ${params.clientName}'s profile at client://${params.clientId}/profile to learn about their background, experience level, goals, and any limitations they have.

For exercise selection, you can use the search-exercises tool to find appropriate exercises that match the client's needs and available equipment.

Once you've designed the program, use the store-program tool to save it to the Spotr database so it can be accessed by both the coach and client.`
        }
      }]
    };
  }
);

// Generate blueprint prompt
server.prompt(
  "generate-blueprint-prompt",
  {
    coachId: z.string().describe("ID of the coach who will create the blueprint"),
    coachName: z.string().describe("Name of the coach"),
    goalFocus: z.string().describe("Primary fitness goal for the blueprint"),
    targetAudience: z.string().describe("Target audience for the blueprint"),
    durationWeeks: z.number().min(1).max(52).describe("Blueprint duration in weeks"),
    sessionsPerWeek: z.number().min(1).max(7).describe("Sessions per week"),
    equipmentLevel: z.string().describe("Required equipment level")
  },
  (params) => {
    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Please create a workout blueprint for Coach ${params.coachName} that focuses on ${params.goalFocus}. This blueprint should be designed for ${params.targetAudience}, last for ${params.durationWeeks} weeks with ${params.sessionsPerWeek} sessions per week, and require ${params.equipmentLevel} equipment.

You can access Coach ${params.coachName}'s profile and training style at coach://${params.coachId}/profile and coach://${params.coachId}/style to understand their coaching philosophy and programming approach.

For exercise selection guidelines, you can use the search-exercises tool to find appropriate exercise categories and options that match the target audience's needs and the specified equipment level.

The blueprint should be general enough to be adaptable for multiple clients while still reflecting Coach ${params.coachName}'s unique training approach and philosophy.

Once you've designed the blueprint, use the store-blueprint tool to save it to the Spotr database so it can be used to generate personalized programs for Coach ${params.coachName}'s clients.`
        }
      }]
    };
  }
);

// Personalize program prompt
server.prompt(
  "personalize-program-prompt",
  {
    blueprintId: z.string().describe("ID of the blueprint to personalize"),
    blueprintName: z.string().describe("Name of the blueprint"),
    clientId: z.string().describe("ID of the client"),
    clientName: z.string().describe("Name of the client"),
    specificGoals: z.string().describe("Client's specific goals for this program"),
    specialConsiderations: z.string().optional().describe("Any special considerations for this client")
  },
  (params) => {
    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Please create a personalized fitness program for ${params.clientName} based on the "${params.blueprintName}" blueprint. The program should address ${params.clientName}'s specific goals: ${params.specificGoals}.${params.specialConsiderations ? ` Also consider these special requirements: ${params.specialConsiderations}.` : ''}

You can access the blueprint at blueprint://${params.blueprintId} to see its structure, phases, and general approach.

You can also access ${params.clientName}'s profile at client://${params.clientId}/profile to learn about their background, experience level, current fitness status, and any limitations they have.

Adapt the blueprint to create a personalized program that fits ${params.clientName}'s specific needs while maintaining the core structure and philosophy of the original blueprint.

Once you've personalized the program, use the create-program-from-blueprint tool to save it to the Spotr database so it can be accessed by both the coach and client.`
        }
      }]
    };
  }
);

// Analyze progress prompt
server.prompt(
  "analyze-progress-prompt",
  {
    clientId: z.string().describe("ID of the client"),
    clientName: z.string().describe("Name of the client"),
    programId: z.string().describe("ID of the program"),
    programName: z.string().describe("Name of the program"),
    timeframe: z.enum(["1_week", "2_weeks", "4_weeks", "8_weeks", "entire_program"]).describe("Analysis timeframe")
  },
  (params) => {
    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Please analyze ${params.clientName}'s progress on the "${params.programName}" program over the past ${formatTimeframe(params.timeframe)}.

You can access ${params.clientName}'s profile at client://${params.clientId}/profile to understand their background and goals.

You can access the program details at program://${params.programId} to see what they've been working on.

You can access their progress data at client://${params.clientId}/programs/${params.programId}/progress to see their tracking data, including workout logs, performance metrics, and any notes they've added.

Based on this information, provide a comprehensive analysis of their progress, including:
1. Strength progress for key exercises (comparing initial to current performance)
2. Body composition changes, if data is available
3. Adherence to the program
4. Overall assessment of their progress relative to their goals
5. Actionable recommendations for the next phase of training

Use the store-progress-analysis tool to save this analysis to the Spotr database when you're done.`
        }
      }]
    };
  }
);

// Evaluate program prompt
server.prompt(
  "evaluate-program-prompt",
  {
    entityType: z.enum(["program", "blueprint"]).describe("Type of entity to evaluate"),
    entityId: z.string().describe("ID of the program or blueprint"),
    entityName: z.string().describe("Name of the program or blueprint"),
    evaluationPurpose: z.enum([
      "client_suitability",
      "general_quality",
      "scientific_validity",
      "coach_review",
      "peer_review"
    ]).describe("Purpose of the evaluation"),
    clientId: z.string().optional().describe("ID of the client (if evaluating for client suitability)")
  },
  (params) => {
    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Please evaluate the "${params.entityName}" ${params.entityType} for ${params.evaluationPurpose.replace('_', ' ')}.

You can access the ${params.entityType} details at ${params.entityType}://${params.entityId} to review its structure, approach, and methodology.${params.clientId ? `\n\nYou can also access the client's profile at client://${params.clientId}/profile to understand their specific needs and goals.` : ''}

Provide a comprehensive evaluation including:
1. Overall assessment of the ${params.entityType}'s quality and effectiveness
2. Scores for different aspects (structure, exercise selection, volume/intensity, recovery, specificity, practicality)
3. Key strengths of the ${params.entityType}
4. Areas that could be improved
5. Specific suggestions for improvement
${params.clientId ? '6. A conclusion about whether this is suitable for the client and why' : ''}

Use scientific principles of program design and sports science in your evaluation, considering factors like progressive overload, specificity, recovery, and individual differences.

Once complete, use the evaluate-program tool to record your evaluation in the Spotr database.`
        }
      }]
    };
  }
);

// ========================
// HELPER FUNCTIONS
// ========================

// Helper for finding top improvement in strength progress
function findTopImprovement(strengthProgress: any[]) {
  if (!strengthProgress || strengthProgress.length === 0) {
    return "No exercises tracked";
  }
  
  // Sort by percentage improvement if available
  const sortedExercises = [...strengthProgress].sort((a, b) => 
    (b.percentageImprovement || 0) - (a.percentageImprovement || 0)
  );
  
  const top = sortedExercises[0];
  if (top.percentageImprovement) {
    return `${top.exerciseName} (+${top.percentageImprovement.toFixed(1)}%)`;
  }
  return `${top.exerciseName} (improved from ${top.initialPerformance} to ${top.currentPerformance})`;
}

// Helper for summarizing body composition changes
function summarizeBodyComp(bodyComp: any[]) {
  if (!bodyComp || bodyComp.length === 0) {
    return "No data available";
  }
  
  const weightChange = bodyComp.find(b => b.metric === "weight");
  if (weightChange) {
    const direction = weightChange.change > 0 ? "gained" : "lost";
    const amount = Math.abs(weightChange.change);
    return `${direction} ${amount}${weightChange.unit} overall`;
  }
  
  const bodyFatChange = bodyComp.find(b => b.metric === "body_fat");
  if (bodyFatChange) {
    const direction = bodyFatChange.change > 0 ? "increased" : "decreased";
    const amount = Math.abs(bodyFatChange.change);
    return `body fat ${direction} by ${amount}${bodyFatChange.unit}`;
  }
  
  return `${bodyComp.length} metrics tracked`;
}

// Helper for converting score to rating
function scoreToRating(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Satisfactory";
  if (score >= 50) return "Needs Improvement";
  return "Unsatisfactory";
}

// Start the server
const transport = new StdioServerTransport();
server.connect(transport).catch(err => {
  console.error("Error connecting to transport:", err);
  process.exit(1);
});

console.error("SpotrFitnessServer is running on stdio transport");
 headers: { "X-API-Key": API_KEY } }
    );
    return response.data;
  },
  
  // Program evaluation operations
  async storeEvaluation(evaluationData: any) {
    if (MOCK_MODE) {
      try {
        const evaluations = JSON.parse(fs.readFileSync(path.join(MOCK_DATA_DIR, "evaluations.json"), "utf-8"));
        const newEvaluation = {
          id: `evaluation-${Date.now()}`,
          ...evaluationData,
          createdAt: new Date().toISOString()
        };
        evaluations.push(newEvaluation);
        fs.writeFileSync(
          path.join(MOCK_DATA_DIR, "evaluations.json"),
          JSON.stringify(evaluations, null, 2)
        );
        return newEvaluation;
      } catch (error) {
        console.error("Error storing mock evaluation data:", error);
        throw error;
      }
    }
    
    const response = await axios.post(`${API_BASE_URL}/evaluations`, evaluationData, {
      headers: { "X-API-Key": API_KEY }
    });
    return response.data;
  },
  
  // Share link operations
  async generateShareLink(shareData: any) {
    if (MOCK_MODE) {
      const accessCode = Math.random().toString(36).substring(2, 10);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (shareData.expiresInDays || 30));
      
      return {
        shareUrl: `${WEB_APP_URL}/share/${accessCode}`,
        accessCode,
        expiresAt: expiresAt.toISOString()
      };
    }
    
    const response = await axios.post(`${API_BASE_URL}/share`, shareData, {
      headers: { "X-API-Key": API_KEY }
    });
    return response.data;
  }
};

// Helper functions
function formatTimeframe(timeframe: string) {
  const mapping: Record<string, string> = {
    "1_week": "1 week",
    "2_weeks": "2 weeks",
    "4_weeks": "4 weeks",
    "8_weeks": "8 weeks",
    "entire_program": "Entire program duration"
  };
  return mapping[timeframe] || timeframe;
}

// ========================
// RESOURCES
// ========================

// Coach profile resource
server.resource(
  "coach-profile",
  "coach://{coachId}/profile",
  async (uri, { coachId }) => {
    try {
      const coach = await api.getCoach(coachId);
      
      if (!coach) {
        return {
          contents: [{
            uri: uri.href,
            text: `Coach with ID ${coachId} not found.`,
            mimeType: "text/plain"
          }]
        };
      }
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(coach, null, 2),
          mimeType: "application/json"
        }]
      };
    } catch (error: any) {
      console.error(`Error fetching coach profile for ${coachId}:`, error);
      return {
        contents: [{
          uri: uri.href,
          text: `Error fetching profile for coach ${coachId}: ${error.message}`,
          mimeType: "text/plain"
        }]
      };
    }
  }
);

// Coach style resource
server.resource(
  "coach-style",
  "coach://{coachId}/style",
  async (uri, { coachId }) => {
    try {
      const coachStyle = await api.getCoachStyle(coachId);
      
      if (!coachStyle) {
        return {
          contents: [{
            uri: uri.href,
            text: `Style for coach with ID ${coachId} not found.`,
            mimeType: "text/plain"
          }]
        };
      }
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(coachStyle, null, 2),
          mimeType: "application/json"
        }]
      };
    } catch (error: any) {
      console.error(`Error fetching coach style for ${coachId}:`, error);
      return {
        contents: [{
          uri: uri.href,
          text: `Error fetching style for coach ${coachId}: ${error.message}`,
          mimeType: "text/plain"
        }]
      };
    }
  }
);

// Client profile resource
server.resource(
  "client-profile",
  "client://{clientId}/profile",
  async (uri, { clientId }) => {
    try {
      const client = await api.getClient(clientId);
      
      if (!client) {
        return {
          contents: [{
            uri: uri.href,
            text: `Client with ID ${clientId} not found.`,
            mimeType: "text/plain"
          }]
        };
      }
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(client, null, 2),
          mimeType: "application/json"
        }]
      };
    } catch (error: any) {
      console.error(`Error fetching client profile for ${clientId}:`, error);
      return {
        contents: [{
          uri: uri.href,
          text: `Error fetching profile for client ${clientId}: ${error.message}`,
          mimeType: "text/plain"
        }]
      };
    }
  }
);

// Client progress resource
server.resource(
  "client-progress",
  "client://{clientId}/programs/{programId}/progress",
  async (uri, { clientId, programId }) => {
    try {
      const progress = await api.getClientProgress(clientId, programId);
      
      if (!progress) {
        return {
          contents: [{
            uri: uri.href,
            text: `No progress data found for client ${clientId} on program ${programId}.`,
            mimeType: "text/plain"
          }]
        };
      }
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(progress, null, 2),
          mimeType: "application/json"
        }]
      };
    } catch (error: any) {
      console.error(`Error fetching client progress for ${clientId}, program ${programId}:`, error);
      return {
        contents: [{
          uri: uri.href,
          text: `Error fetching progress data: ${error.message}`,
          mimeType: "text/plain"
        }]
      };
    }
  }
);

// Program resource
server.resource(
  "program",
  "program://{programId}",
  async (uri, { programId }) => {
    try {
      const program = await api.getProgram(programId);
      
      if (!program) {
        return {
          contents: [{
            uri: uri.href,
            text: `Program with ID ${programId} not found.`,
            mimeType: "text/plain"
          }]
        };
      }
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(program, null, 2),
          mimeType: "application/json"
        }]
      };
    } catch (error: any) {
      console.error(`Error fetching program ${programId}:`, error);
      return {
        contents: [{
          uri: uri.href,
          text: `Error fetching program: ${error.message}`,
          mimeType: "text/plain"
        }]
      };
    }
  }
);

// Blueprint resource
server.resource(
  "blueprint",
  "blueprint://{blueprintId}",
  async (uri, { blueprintId }) => {
    try {
      const blueprint = await api.getBlueprint(blueprintId);
      
      if (!blueprint) {
        return {
          contents: [{
            uri: uri.href,
            text: `Blueprint with ID ${blueprintId} not found.`,
            mimeType: "text/plain"
          }]
        };
      }
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(blueprint, null, 2),
          mimeType: "application/json"
        }]
      };
    } catch (error: any) {
      console.error(`Error fetching blueprint ${blueprintId}:`, error);
      return {
        contents: [{
          uri: uri.href,
          text: `Error fetching blueprint: ${error.message}`,
          mimeType: "text/plain"
        }]
      };
    }
  }
);

// Exercise library resource
server.resource(
  "exercise-library",
  "exercise://library",
  async (uri) => {
    try {
      const exercises = await api.getExercises();
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(exercises, null, 2),
          mimeType: "application/json"
        }]
      };
    } catch (error: any) {
      console.error("Error fetching exercise library:", error);
      return {
        contents: [{
          uri: uri.href,
          text: `Error fetching exercise library: ${error.message}`,
          mimeType: "text/plain"
        }]
      };
    }
  }
);

// ========================
// TOOLS
// ========================

// Store program tool
server.tool(
  "store-program",
  {
    coachId: z.string().describe("ID of the coach who designed this program. Example: 'coach-123'"),
    clientId: z.string().describe("ID of the client who will follow this program. Example: 'client-456'"),
    programName: z.string().describe("Clear, descriptive name for the program. Example: '8-Week Upper Body Strength for Sarah'"),
    durationWeeks: z.number().min(1).max(52).describe("Total duration of the program in weeks. Must be between 1-52. Example: 8"),
    sessionsPerWeek: z.number().min(1).max(7).describe("Number of training sessions per week. Must be between 1-7. Example: 4"),
    primaryGoal: z.string().describe("The main fitness goal of the program. Example: 'Hypertrophy', 'Strength', 'Endurance'"),
    description: z.string().describe("Brief overview of the program and its approach. Keep within 1-3 sentences."),
    
    // Phases of the program
    phases: z.array(
      z.object({
        name: z.string().describe("Name of this training phase. Example: 'Hypertrophy Block', 'Strength Phase'"),
        weeks: z.number().min(1).describe("Duration of this phase in weeks. Example: 3"),
        description: z.string().describe("Brief description of this phase's focus and approach"),
        sessions: z.array(
          z.object({
            name: z.string().describe("Name of this session. Example: 'Upper Body Push', 'Lower Body'"),
            dayOfWeek: z.number().min(0).max(6).describe("Day of the week (0=Sunday, 1=Monday, etc.). Example: 1 for Monday"),
            exercises: z.array(
              z.object({
                name: z.string().describe("Name of the exercise. Use common exercise names. Example: 'Barbell Bench Press'"),
                sets: z.number().min(1).describe("Number of sets. Example: 4"),
                reps: z.string().describe("Rep scheme, can include ranges. Example: '8-10', '5'"),
                weight: z.string().describe("Weight/intensity guideline. Example: '70% 1RM', 'RPE 8', 'Moderate'"),
                restPeriod: z.string().describe("Rest between sets. Example: '2 min', '60-90 sec'"),
                notes: z.string().optional().describe("Optional technique cues or special instructions")
              })
            ),
            notes: z.string().optional().describe("Optional instructions for the entire session")
          })
        ).min(1).describe("List of training sessions in this phase"),
        notes: z.string().optional().describe("Optional notes specific to this phase")
      })
    ).min(1).describe("Phases of the program, in chronological order. Most programs have 1-4 phases."),
    
    notes: z.string().optional().describe("Optional general notes about the program. May include nutrition, recovery, or progression advice.")
  },
  async (params) => {
    try {
      // Store the program in the database
      const result = await api.storeProgram(params);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            message: "Program successfully stored in the Spotr database",
            programId: result.id,
            programUrl: `${WEB_APP_URL}/programs/${result.id}`,
            coachId: params.coachId,
            clientId: params.clientId,
            programName: params.programName
          }, null, 2)
        }]
      };
    } catch (error: any) {
      console.error("Error storing program:", error);
      return {
        isError: true,
        content: [{
          type: "text",
          text: `Error storing program: ${error.message}\n\nPlease check that all required fields are provided and properly formatted.`
        }]
      };
    }
  },
  {
    description: `
      Stores a workout program created for a specific client in the Spotr database.
      
      A program is a complete training plan designed for a specific client, with a defined
      duration, frequency, and structured progression.
      
      EXAMPLE USAGE:
      ```
      // Example: Storing a strength training program
      store-program({
        coachId: "coach-123",
        clientId: "client-456",
        programName: "8-Week Upper Body Strength for Sarah",
        durationWeeks: 8,
        sessionsPerWeek: 4,
        primaryGoal: "Strength",
        description: "An 8-week program focusing on upper body strength development for an intermediate lifter with full gym access.",
        phases: [
          {
            name: "Accumulation Phase",
            weeks: 3,
            description: "Focus on building volume with moderate intensity",
            sessions: [
              {
                name: "Push Day A",
                dayOfWeek: 1,
                exercises: [
                  {
                    name: "Bench Press",
                    sets: 4,
                    reps: "8-10",
                    weight: "70-75% 1RM",
                    restPeriod: "2 min"
                  },
                  // More exercises...
                ]
              },
              // More sessions...
            ]
          },
          // More phases...
        ]
      })
      ```
      
      WHEN TO USE:
      Use this tool when you've created a personalized workout program for a specific client
      and want to store it in the Spotr database.
      
      DO NOT USE:
      If you want to create a blueprint that can be used for multiple clients, use the store-blueprint tool instead.
    `
  }
);

// Store blueprint tool
server.tool(
  "store-blueprint",
  {
    coachId: z.string().describe("ID of the coach creating the blueprint. Example: 'coach-123'"),
    blueprintName: z.string().describe("Name of the blueprint. Example: 'Intermediate Upper Body Strength Blueprint'"),
    targetAudience: z.string().describe("Who this blueprint is designed for. Example: 'Intermediate female lifters focused on upper body strength'"),
    durationWeeks: z.number().min(1).max(52).describe("Total duration in weeks. Must be between 1-52. Example: 8"),
    sessionsPerWeek: z.number().min(1).max(7).describe("Sessions per week. Must be between 1-7. Example: 4"),
    fitnessGoal: z.string().describe("Primary fitness goal. Example: 'Strength', 'Hypertrophy', 'Endurance'"),
    equipmentLevel: z.string().describe("Required equipment access. Example: 'Home', 'Basic Gym', 'Full Gym'"),
    description: z.string().describe("Brief overview of the blueprint and its approach"),
    
    // Blueprint structure, similar to program but more generalized
    phases: z.array(
      z.object({
        name: z.string().describe("Name of this training phase"),
        weeks: z.number().min(1).describe("Duration of this phase in weeks"),
        description: z.string().describe("Description of this phase's focus"),
        sessionTemplates: z.array(
          z.object({
            name: z.string().describe("Name of this session template"),
            description: z.string().describe("Brief description of the session's purpose"),
            exerciseCategories: z.array(
              z.object({
                category: z.string().describe("Category of exercise. Example: 'Compound Upper Push', 'Isolation Shoulder'"),
                setRange: z.string().describe("Recommended sets. Example: '3-4'"),
                repRange: z.string().describe("Recommended rep range. Example: '8-12'"),
                intensityGuideline: z.string().describe("Intensity guideline. Example: '70-75% 1RM', 'RPE 7-8'"),
                notes: z.string().optional().describe("Optional notes for this exercise category")
              })
            ),
            notes: z.string().optional().describe("Optional notes for this session template")
          })
        ),
        progressionStrategy: z.string().describe("How to progress through this phase"),
        notes: z.string().optional().describe("Optional notes specific to this phase")
      })
    ).min(1).describe("Phases of the blueprint, in chronological order"),
    
    notes: z.string().optional().describe("Optional general notes about the blueprint")
  },
  async (params) => {
    try {
      // Store the blueprint in the database
      const result = await api.storeBlueprint(params);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            message: "Blueprint successfully stored in the Spotr database",
            blueprintId: result.id,
            blueprintUrl: `${WEB_APP_URL}/blueprints/${result.id}`,
            coachId: params.coachId,
            blueprintName: params.blueprintName
          }, null, 2)
        }]
      };
    } catch (error: any) {
      console.error("Error storing blueprint:", error);
      return {
        isError: true,
        content: [{
          type: "text",
          text: `Error storing blueprint: ${error.message}\n\nPlease check that all required fields are provided and properly formatted.`
        }]
      };
    }
  },
  {