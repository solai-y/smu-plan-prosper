import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useUserProgress() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-progress", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useToggleModuleComplete() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ moduleCode, completed }: { moduleCode: string; completed: boolean }) => {
      if (completed) {
        const { error } = await supabase
          .from("user_progress")
          .delete()
          .eq("user_id", user!.id)
          .eq("module_code", moduleCode);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_progress")
          .insert({ user_id: user!.id, module_code: moduleCode });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-progress"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
