import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface MessageResponse {
  message: string;
  note: string;
  env: string;
}

export function useMessage() {
  return useQuery<MessageResponse>({
    queryKey: ["message"],
    queryFn: () => api.get("/api/message"),
  });
}
