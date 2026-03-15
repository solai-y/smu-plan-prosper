import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useModules } from "@/hooks/useModules";
import { useUserProgress, useToggleModuleComplete } from "@/hooks/useUserProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle } from "lucide-react";

const GROUP_ORDER = [
  { key: "Programme Core", label: "Programme Core", totalCUs: 3 },
  { key: "Workshops", label: "Workshops", totalCUs: 1 },
  { key: "Track Core", label: "Track Core", totalCUs: 4 },
  { key: "Track Electives", label: "Track Electives", totalCUs: 3 },
  { key: "Open Electives", label: "Open Electives", totalCUs: 4 },
];

export default function GraduationRequirements() {
  const { data: modules } = useModules();
  const { data: progress, isLoading } = useUserProgress();

  const completedCodes = useMemo(
    () => new Set(progress?.map((p) => p.module_code) ?? []),
    [progress]
  );

  const grouped = useMemo(() => {
    if (!modules) return new Map<string, typeof modules>();
    const map = new Map<string, typeof modules>();
    for (const g of GROUP_ORDER) {
      map.set(g.key, []);
    }
    modules.forEach((m) => {
      const group = (m as any).module_group || "Open Electives";
      const arr = map.get(group) ?? [];
      arr.push(m);
      map.set(group, arr);
    });
    return map;
  }, [modules]);

  const totalRequired = GROUP_ORDER.reduce((s, g) => s + g.totalCUs, 0);
  const totalCompleted = useMemo(() => {
    let count = 0;
    GROUP_ORDER.forEach((g) => {
      const mods = grouped.get(g.key) ?? [];
      const completed = mods.filter((m) => completedCodes.has(m.code)).length;
      count += Math.min(completed, g.totalCUs);
    });
    return count;
  }, [grouped, completedCodes]);

  const percentage = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;

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
        <h1 className="text-2xl font-bold">Graduation Requirements</h1>
        <p className="text-muted-foreground">Track your progress towards graduation</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {totalCompleted} of {totalRequired} CUs completed
            </span>
            <span className="font-semibold">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-3" />
        </CardContent>
      </Card>

      {GROUP_ORDER.map((group) => {
        const mods = grouped.get(group.key) ?? [];
        const completedInGroup = mods.filter((m) => completedCodes.has(m.code)).length;

        return (
          <div key={group.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{group.label} ({group.totalCUs} CUs)</h2>
              <Badge variant="outline">
                {Math.min(completedInGroup, group.totalCUs)}/{group.totalCUs} completed
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {mods.map((module) => {
                const done = completedCodes.has(module.code);
                return (
                  <Link key={module.id} to={`/module/${module.code}`}>
                    <Card className={`h-full transition-shadow hover:shadow-md cursor-pointer ${done ? "border-success/30 bg-success/5" : ""}`}>
                      <CardContent className="flex items-center gap-3 p-4">
                        {done ? (
                          <CheckCircle className="h-5 w-5 text-success shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground/30 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-mono text-sm font-medium">{module.code}</p>
                          <p className="text-sm text-muted-foreground truncate">{module.name}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
