export function log(
  message: string,
  level: "info" | "warn" | "error" = "info"
) {
  const timestamp = new Date().toISOString();
  console.error(`${timestamp} [${level}] ${message}`);
}
