import { useMemo, useState } from "react";
import { useTimetableEntries, useAllSlots, useAddTimetableEntry, useRemoveTimetableEntry } from "@/hooks/useTimetable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, X, Clock, MapPin, ArrowRightLeft } from "lucide-react";

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeWindows = [
  { start: "08:15", end: "11:30", label: "8:15–11:30 AM" },
  { start: "12:00", end: "15:15", label: "12:00–3:15 PM" },
  { start: "15:30", end: "18:45", label: "3:30–6:45 PM" },
  { start: "19:00", end: "22:15", label: "7:00–10:15 PM" },
];

export default function Timetable() {
  const { data: entries, isLoading } = useTimetableEntries();
  const { data: allSlots } = useAllSlots();
  const addEntry = useAddTimetableEntry();
  const removeEntry = useRemoveTimetableEntry();
  const [selectedSlot, setSelectedSlot] = useState("");
  const [alternateModuleId, setAlternateModuleId] = useState<string | null>(null);
  const [alternateEntryId, setAlternateEntryId] = useState<string | null>(null);

  const entryMap = useMemo(() => {
    const map = new Map<string, typeof entries extends (infer T)[] | undefined ? T : never>();
    entries?.forEach((e) => {
      const slot = e.module_slots;
      if (slot) {
        const key = `${slot.day_of_week}-${slot.start_time}`;
        map.set(key, e);
      }
    });
    return map;
  }, [entries]);

  const addedSlotIds = useMemo(
    () => new Set(entries?.map((e) => e.module_slot_id) ?? []),
    [entries]
  );

  const availableSlots = useMemo(
    () => allSlots?.filter((s) => !addedSlotIds.has(s.id)) ?? [],
    [allSlots, addedSlotIds]
  );

  // Get alternate slots for a module (other sections not currently added)
  const alternateSlots = useMemo(() => {
    if (!alternateModuleId || !allSlots) return [];
    return allSlots.filter(
      (s) => (s.modules as any)?.id === alternateModuleId && !addedSlotIds.has(s.id)
    );
  }, [alternateModuleId, allSlots, addedSlotIds]);

  const handleSwitchSlot = (newSlotId: string) => {
    if (alternateEntryId) {
      removeEntry.mutate(alternateEntryId);
    }
    addEntry.mutate(newSlotId);
    setAlternateModuleId(null);
    setAlternateEntryId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">Plan your weekly schedule</p>
      </div>

      {/* Add slot control */}
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center">
          <Select value={selectedSlot} onValueChange={setSelectedSlot}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a module slot to add..." />
            </SelectTrigger>
            <SelectContent>
              {availableSlots.map((slot) => {
                const mod = slot.modules as any;
                return (
                  <SelectItem key={slot.id} value={slot.id}>
                    {mod?.code} — {mod?.name} ({slot.section}, {dayNames[slot.day_of_week]} {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              if (selectedSlot) {
                addEntry.mutate(selectedSlot);
                setSelectedSlot("");
              }
            }}
            disabled={!selectedSlot || addEntry.isPending}
          >
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </CardContent>
      </Card>

      {/* Weekly Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-primary p-3 text-xs font-medium text-primary-foreground">Time</div>
            {dayNames.slice(0, 6).map((day) => (
              <div key={day} className="bg-primary p-3 text-xs font-medium text-primary-foreground text-center">
                {day}
              </div>
            ))}

            {/* Body */}
            {timeWindows.map((tw) => (
              <>
                <div key={tw.label} className="bg-card p-3 text-xs text-muted-foreground font-mono border-t">
                  {tw.label}
                </div>
                {dayNames.slice(0, 6).map((_, dayIdx) => {
                  const key = `${dayIdx}-${tw.start}:00`;
                  const entry = entryMap.get(key);
                  const slot = entry?.module_slots;
                  const mod = slot ? (slot as any).modules : null;

                  return (
                    <div key={`${dayIdx}-${tw.start}`} className="bg-card p-2 border-t min-h-[80px]">
                      {entry && mod && (
                        <div
                          className="rounded-md bg-accent p-2 text-xs space-y-1 relative group cursor-pointer"
                          onClick={() => {
                            setAlternateModuleId(mod.id);
                            setAlternateEntryId(entry.id);
                          }}
                        >
                          <p className="font-mono font-semibold text-accent-foreground">{mod.code}</p>
                          <p className="text-muted-foreground truncate">{mod.name}</p>
                          <p className="text-muted-foreground">{(slot as any).section} · {(slot as any).venue}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeEntry.mutate(entry.id);
                            }}
                            className="absolute -top-1 -right-1 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      {/* Alternate Timings Dialog */}
      <Dialog open={!!alternateModuleId} onOpenChange={(open) => { if (!open) { setAlternateModuleId(null); setAlternateEntryId(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Switch Section
            </DialogTitle>
          </DialogHeader>
          {alternateSlots.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Select an alternate time slot:</p>
              {alternateSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleSwitchSlot(slot.id)}
                  className="flex w-full items-center gap-3 rounded-md border p-3 text-sm hover:bg-accent transition-colors text-left"
                >
                  <Badge variant="outline" className="font-mono">{slot.section}</Badge>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {dayNames[slot.day_of_week]} {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {slot.venue}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">No other sections available for this module.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
