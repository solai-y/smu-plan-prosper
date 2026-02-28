import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Module = Tables<"modules">;

export function useModules() {
  return useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("code");
      if (error) throw error;
      return data as Module[];
    },
  });
}

export function useModule(code: string) {
  return useQuery({
    queryKey: ["module", code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("code", code)
        .single();
      if (error) throw error;
      return data as Module;
    },
    enabled: !!code,
  });
}

export function useModuleSlots(moduleId: string) {
  return useQuery({
    queryKey: ["module-slots", moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_slots")
        .select("*")
        .eq("module_id", moduleId)
        .order("day_of_week")
        .order("start_time");
      if (error) throw error;
      return data;
    },
    enabled: !!moduleId,
  });
}

export function useModuleReviews(moduleId: string) {
  return useQuery({
    queryKey: ["reviews", moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("module_id", moduleId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!moduleId,
  });
}

export function useAllReviews() {
  return useQuery({
    queryKey: ["all-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*");
      if (error) throw error;
      return data;
    },
  });
}
