// Generic wrapper for API errors coming back from the backend
export type ApiError = {
  statusCode: number;
  message: string | string[];
  error?: string;
};
