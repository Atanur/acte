import { ApiClient } from "api-client";

export const api = new ApiClient(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000");
