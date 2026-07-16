import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import {BACKEND_URL} from "@/constants";
import {interceptorFetch} from "@/api/auth.ts";

/**
 * Normalize Axios headers → Fetch Headers
 * (NO AxiosHeaders.from, avoids all typing issues)
 */
const toFetchHeaders = (
  axiosHeaders: AxiosRequestConfig["headers"],
): Headers => {
  const headers = new Headers();

  if (!axiosHeaders) return headers;

  // Axios v1 headers can be plain object OR AxiosHeaders instance
  const source = hasToJson(axiosHeaders)
    ? axiosHeaders.toJSON()
    : (axiosHeaders as Record<string, unknown>);

  for (const [key, value] of Object.entries(source)) {
    if (value == null) continue;
    headers.set(key, String(value));
  }

  return headers;
};

interface HeadersWithToJson {
  toJSON(): Record<string, unknown>;
}

function hasToJson(value: unknown): value is HeadersWithToJson {
  return (
    typeof value === "object" &&
    value !== null &&
    "toJSON" in value &&
    typeof (value as { toJSON?: unknown }).toJSON === "function"
  );
}

/**
 * Normalize Axios params → URLSearchParams
 */
const toSearchParams = (
  params: AxiosRequestConfig["params"],
): URLSearchParams => {
  const searchParams = new URLSearchParams();

  if (!params || typeof params !== "object") {
    return searchParams;
  }

  if (params instanceof URLSearchParams) {
    return params;
  }

  for (const [key, value] of Object.entries(
    params as Record<string, unknown>,
  )) {
    if (value == null) continue;

    if (Array.isArray(value)) {
      value.forEach((v) =>
        searchParams.append(key, String(v)),
      );
    } else {
      searchParams.append(key, String(value));
    }
  }

  return searchParams;
};

const createFetchAdapter = (customFetch?: typeof fetch) => {
  const useFetch =
    customFetch ??
    globalThis.replacementFetch ??
    fetch;

  return async (
    config: InternalAxiosRequestConfig,
  ): Promise<AxiosResponse> => {
    const baseURL = config.baseURL ?? "";
    const url = new URL(config.url ?? "", baseURL);

    const params = toSearchParams(config.params);
    params.forEach((v, k) => {
      url.searchParams.append(k, v);
    });

    const method = (config.method ?? "get").toUpperCase();
    const headers = toFetchHeaders(config.headers);

    let body: BodyInit | undefined;

    if (
      config.data != null &&
      method !== "GET" &&
      method !== "HEAD"
    ) {
      const isJsonLike =
        typeof config.data === "object" &&
        !(config.data instanceof FormData) &&
        !(config.data instanceof URLSearchParams) &&
        !(config.data instanceof Blob);

      if (isJsonLike) {
        body = JSON.stringify(config.data);

        if (!headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }
      } else {
        body = config.data as BodyInit;
      }
    }

    const res = await useFetch(url.toString(), {
      method,
      headers,
      body,
      signal:
        config.signal instanceof AbortSignal
          ? config.signal
          : undefined,
    });

    const contentType =
      res.headers.get("content-type") ?? "";

    const data = contentType.includes("application/json")
      ? await res.json()
      : await res.text();

    const responseHeaders: Record<string, string> = {};

    res.headers.forEach((v, k) => {
      responseHeaders[k] = v;
    });

    const response: AxiosResponse = {
      data,
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
      config,
      request: res,
    };

    // Make fetch behave like Axios
    if (!res.ok) {
      throw new axios.AxiosError(
        `Request failed with status code ${res.status}`,
        undefined,
        config,
        res,
        response,
      );
    }

    return response;
  };
};

const customFetch: typeof fetch = async (
  input,
  init,
): Promise<Response> => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

  return interceptorFetch(url, init);
};

const statsApiClient = axios.create({
  baseURL: `${BACKEND_URL}`,
  headers: {
    Accept: "application/json",
  },
  adapter: createFetchAdapter(customFetch),
});

statsApiClient.interceptors.response.use(
  (response) => {
    const payload = response.data as { data?: unknown } | unknown;

    if (
      payload &&
      typeof payload === "object" &&
      "data" in payload
    ) {
      response.data = (payload as { data?: unknown }).data;
    }

    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default statsApiClient;
