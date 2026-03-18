import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useTimetableEntries() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["timetable", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("timetable_entries")
        .select("*, module_slots(*, modules(*))")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAllSlots() {
  return useQuery({
    queryKey: ["all-slots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_slots")
        .select("*, modules(*)")
        .order("day_of_week")
        .order("start_time");
      if (error) throw error;
      return data;
    },
  });
}

export function useAddTimetableEntry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moduleSlotId: string) => {
      // Get the new slot's day and time
      const { data: newSlot, error: slotErr } = await supabase
        .from("module_slots")
        .select("day_of_week, start_time")
        .eq("id", moduleSlotId)
        .single();
      if (slotErr || !newSlot) throw new Error("Could not find slot details");

      // Check if user already has an entry at the same day + time
      const { data: existing, error: existErr } = await supabase
        .from("timetable_entries")
        .select("id, module_slots!inner(day_of_week, start_time, modules(code, name))")
        .eq("user_id", user!.id);
      if (existErr) throw existErr;

      const conflict = existing?.find((e: any) => {
        const s = e.module_slots;
        return s && s.day_of_week === newSlot.day_of_week && s.start_time === newSlot.start_time;
      });

      if (conflict) {
        const mod = (conflict as any).module_slots?.modules;
        const label = mod ? `${mod.code} — ${mod.name}` : "another module";
        throw new Error(`This time slot is already taken by ${label}.`);
      }

      const { error } = await supabase
        .from("timetable_entries")
        .insert({ user_id: user!.id, module_slot_id: moduleSlotId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable"] });
      toast.success("Slot added to timetable");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRemoveTimetableEntry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from("timetable_entries")
        .delete()
        .eq("id", entryId)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable"] });
      toast.success("Slot removed");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
