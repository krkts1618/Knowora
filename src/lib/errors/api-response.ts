import { NextResponse } from "next/server";
import { AppError } from "./app-error";
import { ZodError } from "zod";

export interface ApiResponseSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiResponseError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

export function apiSuccess<T>(data: T, message?: string, status = 200) {
  const payload: ApiResponseSuccess<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
  return NextResponse.json(payload, { status });
}

export function apiError(message: string, status = 500, code = "INTERNAL_SERVER_ERROR", details?: unknown) {
  const payload: ApiResponseError = {
    success: false,
    error: {
      message,
      code,
      ...(details ? { details } : {}),
    },
  };
  return NextResponse.json(payload, { status });
}

export function handleApiError(err: unknown) {
  if (err instanceof AppError) {
    return apiError(err.message, err.statusCode, err.code, err.details);
  }

  if (err instanceof ZodError) {
    return apiError("Validation failed", 400, "VALIDATION_ERROR", err.flatten().fieldErrors);
  }

  console.error("Unhandled API error:", err);
  const message = err instanceof Error ? err.message : "An unexpected error occurred";
  return apiError(message, 500, "INTERNAL_SERVER_ERROR");
}
