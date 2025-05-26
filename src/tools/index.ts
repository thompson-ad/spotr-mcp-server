import { registerMovementTools } from "./movements.js";
import { registerProgramTools } from "./programs.js";

export function registerAllTools() {
  registerMovementTools();
  registerProgramTools();
}
