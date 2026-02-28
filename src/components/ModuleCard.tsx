import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { Module } from "@/hooks/useModules";

interface ModuleCardProps {
  module: Module;
  eligibility: "completed" | "eligible" | "ineligible";
  avgRating?: number;
  reviewCount?: number;
}

const badgeMap = {
  completed: { label: "Completed", className: "bg-muted text-muted-foreground" },
  eligible: { label: "Eligible", className: "bg-success text-success-foreground" },
  ineligible: { label: "Ineligible", className: "bg-destructive text-destructive-foreground" },
};

export default function ModuleCard({ module, eligibility, avgRating, reviewCount }: ModuleCardProps) {
  const badge = badgeMap[eligibility];

  return (
    <Link to={`/module/${module.code}`}>
      <Card className="h-full transition-shadow hover:shadow-md animate-fade-in">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-mono font-medium text-muted-foreground">{module.code}</p>
              <CardTitle className="text-base leading-tight mt-1">{module.name}</CardTitle>
            </div>
            <Badge className={badge.className}>{badge.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{module.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {module.prerequisites.length > 0 ? (
                module.prerequisites.map((p) => (
                  <Badge key={p} variant="outline" className="text-xs font-mono">
                    {p}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No prerequisites</span>
              )}
            </div>
            {avgRating != null && (
              <div className="flex items-center gap-1 text-sm text-secondary">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="font-medium">{avgRating.toFixed(1)}</span>
                <span className="text-muted-foreground text-xs">({reviewCount})</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
