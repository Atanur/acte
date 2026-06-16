export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorResponse(err: unknown) {
  if (err instanceof AppError) {
    return {
      status: "error" as const,
      error: err.code,
      message: err.message,
      details: err.details,
      timestamp: new Date().toISOString(),
    };
  }
  return {
    status: "error" as const,
    error: "INTERNAL_ERROR",
    message: "Something went wrong",
    timestamp: new Date().toISOString(),
  };
}
