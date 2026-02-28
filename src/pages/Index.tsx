import { useState, useMemo } from "react";
import { useModules, useAllReviews } from "@/hooks/useModules";
import { useUserProgress } from "@/hooks/useUserProgress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ModuleCard from "@/components/ModuleCard";
import { Search } from "lucide-react";

function getEligibility(
  module: { code: string; prerequisites: string[] },
  completedCodes: Set<string>
): "completed" | "eligible" | "ineligible" {
  if (completedCodes.has(module.code)) return "completed";
  if (module.prerequisites.length === 0) return "eligible";
  if (module.prerequisites.every((p) => completedCodes.has(p))) return "eligible";
  return "ineligible";
}

export default function Index() {
  const { data: modules, isLoading } = useModules();
  const { data: progress } = useUserProgress();
  const { data: allReviews } = useAllReviews();
  const [search, setSearch] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("all");

  const completedCodes = useMemo(
    () => new Set(progress?.map((p) => p.module_code) ?? []),
    [progress]
  );

  const reviewStats = useMemo(() => {
    const map = new Map<string, { sum: number; count: number }>();
    allReviews?.forEach((r) => {
      const existing = map.get(r.module_id) ?? { sum: 0, count: 0 };
      map.set(r.module_id, { sum: existing.sum + r.rating, count: existing.count + 1 });
    });
    return map;
  }, [allReviews]);

  const filtered = useMemo(() => {
    if (!modules) return [];
    const q = search.toLowerCase();
    return modules.filter((m) => {
      const matchSearch = m.code.toLowerCase().includes(q) || m.name.toLowerCase().includes(q);
      const matchSchool = schoolFilter === "all" || m.school === schoolFilter;
      return matchSearch && matchSchool;
    });
  }, [modules, search, schoolFilter]);

  const schools = useMemo(() => {
    const set = new Set(modules?.map((m) => m.school) ?? []);
    return Array.from(set).sort();
  }, [modules]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Module Explorer</h1>
        <p className="text-muted-foreground">Browse and search SMU modules</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={schoolFilter} onValueChange={setSchoolFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Schools" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Schools</SelectItem>
            {schools.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((module) => {
          const stats = reviewStats.get(module.id);
          return (
            <ModuleCard
              key={module.id}
              module={module}
              eligibility={getEligibility(module, completedCodes)}
              avgRating={stats ? stats.sum / stats.count : undefined}
              reviewCount={stats?.count}
            />
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-10">No modules found.</p>
      )}
    </div>
  );
}
