import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useTerms() {
  return useQuery({
    queryKey: [api.terms.list.path],
    queryFn: async () => {
      const res = await fetch(api.terms.list.path);
      if (!res.ok) throw new Error("Failed to fetch terms");
      return api.terms.list.responses[200].parse(await res.json());
    },
  });
}

// Since the app loads all terms at once for client-side filtering/gaming,
// we mostly rely on useTerms() and filter locally.
// Specific term fetch might be useful for deep linking in future.
export function useTerm(id: number) {
  return useQuery({
    queryKey: [api.terms.get.path, id],
    queryFn: async () => {
      const res = await fetch(api.terms.get.path.replace(':id', String(id)));
      if (!res.ok) throw new Error("Failed to fetch term");
      return api.terms.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}
