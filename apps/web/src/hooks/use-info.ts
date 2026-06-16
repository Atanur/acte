import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface InfoResponse {
  app: string;
  version: string;
  description: string;
  techStack: Record<string, string>;
}

export function useInfo() {
  return useQuery<InfoResponse>({
    queryKey: ["info"],
    queryFn: () => api.get("/api/info"),
  });
}
