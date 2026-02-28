import { useMemo } from "react";
import { useModules } from "@/hooks/useModules";
import { useUserProgress, useToggleModuleComplete } from "@/hooks/useUserProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Trash2 } from "lucide-react";

export default function ProgressPage() {
  const { data: modules } = useModules();
  const { data: progress, isLoading } = useUserProgress();
  const toggleComplete = useToggleModuleComplete();

  const completedCodes = useMemo(
    () => new Set(progress?.map((p) => p.module_code) ?? []),
    [progress]
  );

  const percentage = modules && modules.length > 0
    ? Math.round((completedCodes.size / modules.length) * 100)
    : 0;

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
        <h1 className="text-2xl font-bold">My Progress</h1>
        <p className="text-muted-foreground">Track your completed modules</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedCodes.size} of {modules?.length ?? 0} modules completed
            </span>
            <span className="font-semibold">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {modules?.map((module) => {
          const done = completedCodes.has(module.code);
          return (
            <Card key={module.id} className={done ? "border-success/30 bg-success/5" : ""}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {done ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/30" />
                  )}
                  <div>
                    <p className="font-mono text-sm font-medium">{module.code}</p>
                    <p className="text-sm text-muted-foreground">{module.name}</p>
                  </div>
                </div>
                <Button
                  variant={done ? "ghost" : "outline"}
                  size="sm"
                  onClick={() => toggleComplete.mutate({ moduleCode: module.code, completed: done })}
                  disabled={toggleComplete.isPending}
                >
                  {done ? <Trash2 className="h-4 w-4" /> : "Complete"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
