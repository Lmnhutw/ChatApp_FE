import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { appConfig } from "@/config/env";
import { clearAuthSession, getAccessToken } from "./authStorage";

export interface ApiError {
  status?: number;
  message: string;
  code?: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = "ApiClientError";
    this.status = apiError.status;
    this.code = apiError.code;
    this.details = apiError.details;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value : undefined;

const firstValidationMessage = (value: unknown): string | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  for (const fieldMessages of Object.values(value)) {
    if (Array.isArray(fieldMessages)) {
      const message = fieldMessages.find(
        (item): item is string => typeof item === "string" && item.length > 0
      );

      if (message) {
        return message;
      }
    }
  }

  return undefined;
};

const extractErrorMessage = (data: unknown): string | undefined => {
  if (typeof data === "string" && data.trim().length > 0) {
    return data;
  }

  if (!isRecord(data)) {
    return undefined;
  }

  return (
    readString(data.message) ??
    readString(data.Message) ??
    readString(data.title) ??
    readString(data.error) ??
    firstValidationMessage(data.errors)
  );
};

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiClientError) {
    return {
      status: error.status,
      message: error.message,
      code: error.code,
      details: error.details,
    };
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<unknown>;
    const responseData = axiosError.response?.data;

    return {
      status: axiosError.response?.status,
      message:
        extractErrorMessage(responseData) ??
        axiosError.message ??
        "The request could not be completed.",
      details: responseData,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: "An unexpected error occurred.",
    details: error,
  };
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string => toApiError(error).message || fallback;

export const apiClient = axios.create({
  baseURL: appConfig.apiUrl || undefined,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!appConfig.apiUrl && config.url?.startsWith("/api/")) {
    throw new ApiClientError({
      message:
        "NEXT_PUBLIC_API_URL is not configured. Set it to the backend API base URL.",
    });
  }

  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error);

    if (apiError.status === 401) {
      clearAuthSession();
    }

    return Promise.reject(new ApiClientError(apiError));
  }
);
