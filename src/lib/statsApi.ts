import axios from "axios";
import { BACKEND_URL } from "@/constants";

const statsApiClient = axios.create({
  baseURL: `${BACKEND_URL}/v1`,
  headers: {
    Accept: "application/json",
  },
});

statsApiClient.interceptors.response.use((response) => {
  const payload = response.data as { data?: unknown } | unknown;
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as { data?: unknown })
  ) {
    response.data = (payload as { data?: unknown }).data;
  }
  return response;
});

export default statsApiClient;
