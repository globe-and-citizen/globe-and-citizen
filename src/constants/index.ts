export * from "./polymarket";
export * from "./network";
const resolvedBackendUrl = (
  import.meta.env.VITE_APP_BACKEND_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  ""
).trim();

const normalizedBackendUrl = resolvedBackendUrl
  .replace(/\/+$/, "")
  .replace(/\/v1$/i, "");

export const BACKEND_URL = normalizedBackendUrl;
