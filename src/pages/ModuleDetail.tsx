import { useParams, Link, useNavigate } from "react-router-dom";
import { useModule, useModuleSlots, useModuleReviews } from "@/hooks/useModules";
import { useUserProgress, useToggleModuleComplete } from "@/hooks/useUserProgress";
import { useAddTimetableEntry } from "@/hooks/useTimetable";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Star, Clock, MapPin, CheckCircle, Plus, AlertTriangle } from "lucide-react";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** Check if a prerequisite string (which may contain "|" for OR) is satisfied */
function isPrereqSatisfied(prereq: string, completedCodes: Set<string>): boolean {
  if (prereq.includes("|")) {
    return prereq.split("|").some((code) => completedCodes.has(code.trim()));
  }
  return completedCodes.has(prereq.trim());
}

function getEligibility(
  code: string,
  prereqs: string[],
  completedCodes: Set<string>
): "completed" | "eligible" | "ineligible" {
  if (completedCodes.has(code)) return "completed";
  if (prereqs.length === 0 || prereqs.every((p) => isPrereqSatisfied(p, completedCodes))) return "eligible";
  return "ineligible";
}

function getMissingPrereqs(prereqs: string[], completedCodes: Set<string>): string[] {
  return prereqs.filter((p) => !isPrereqSatisfied(p, completedCodes)).map((p) =>
    p.includes("|") ? p.split("|").map((c) => c.trim()).join(" or ") : p
  );
}

const badgeMap = {
  completed: { label: "Completed", className: "bg-muted text-muted-foreground" },
  eligible: { label: "Eligible", className: "bg-success text-success-foreground" },
  ineligible: { label: "Ineligible", className: "bg-destructive text-destructive-foreground" },
};

export default function ModuleDetail() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { data: module, isLoading } = useModule(code ?? "");
  const { data: slots } = useModuleSlots(module?.id ?? "");
  const { data: reviews } = useModuleReviews(module?.id ?? "");
  const { data: progress } = useUserProgress();
  const toggleComplete = useToggleModuleComplete();
  const addEntry = useAddTimetableEntry();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const completedCodes = useMemo(
    () => new Set(progress?.map((p) => p.module_code) ?? []),
    [progress]
  );

  if (isLoading || !module) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const eligibility = getEligibility(module.code, module.prerequisites, completedCodes);
  const badge = badgeMap[eligibility];
  const isCompleted = completedCodes.has(module.code);
  const missingPrereqs = getMissingPrereqs(module.prerequisites, completedCodes);
  const canComplete = missingPrereqs.length === 0;
  const corequisites = (module as any).corequisites as string[] | undefined;

  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null;

  const handleReview = async () => {
    if (rating === 0) return toast.error("Please select a rating");
    setSubmitting(true);
    const { error } = await supabase.from("reviews").upsert(
      { module_id: module.id, user_id: user!.id, rating, comment },
      { onConflict: "module_id,user_id" }
    );
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Review submitted!");
    setRating(0);
    setComment("");
    queryClient.invalidateQueries({ queryKey: ["reviews", module.id] });
    queryClient.invalidateQueries({ queryKey: ["all-reviews"] });
  };

  const handleAddSlot = (slotId: string) => {
    addEntry.mutate(slotId);
    navigate("/timetable");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Graduation Requirements
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-mono text-muted-foreground">{module.code} · {module.school} · {module.credit_units} CU</p>
          <h1 className="text-2xl font-bold mt-1">{module.name}</h1>
          <p className="mt-2 text-muted-foreground">{module.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={badge.className}>{badge.label}</Badge>
          {avgRating != null && (
            <div className="flex items-center gap-1 text-secondary">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-medium">{avgRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Prerequisites */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Prerequisites</CardTitle>
        </CardHeader>
        <CardContent>
          {module.prerequisites.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {module.prerequisites.map((p, i) => {
                const display = p.includes("|") ? p.split("|").map((c) => c.trim()).join(" or ") : p;
                const satisfied = isPrereqSatisfied(p, completedCodes);
                return (
                  <Badge key={i} variant="outline" className="font-mono">
                    {display}
                    {satisfied && <CheckCircle className="ml-1 h-3 w-3 text-success" />}
                  </Badge>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No prerequisites required.</p>
          )}
          {corequisites && corequisites.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1">Co-requisites:</p>
              <div className="flex flex-wrap gap-2">
                {corequisites.map((c) => (
                  <Link key={c} to={`/module/${c}`}>
                    <Badge variant="outline" className="font-mono cursor-pointer hover:bg-accent">
                      {c} (co-req)
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mark as Complete — gated by prerequisites */}
      {canComplete ? (
        <Button
          variant={isCompleted ? "outline" : "default"}
          onClick={() => toggleComplete.mutate({ moduleCode: module.code, completed: isCompleted })}
          disabled={toggleComplete.isPending}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          {isCompleted ? "Mark as Incomplete" : "Mark as Completed"}
        </Button>
      ) : (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Prerequisites not met</p>
              <p className="text-sm text-muted-foreground">
                Complete the following first: {missingPrereqs.join(", ")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Slots — clickable to add to calendar */}
      {slots && slots.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Time Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleAddSlot(slot.id)}
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
                  <Plus className="ml-auto h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Form — only shown if completed */}
      {isCompleted && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Leave a Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => setRating(s)}>
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      s <= rating ? "fill-secondary text-secondary" : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Share your experience with this module..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <Button onClick={handleReview} disabled={submitting} size="sm">
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {reviews && reviews.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reviews ({reviews.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="border-b last:border-0 pb-3 last:pb-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${
                          s <= review.rating ? "fill-secondary text-secondary" : "text-muted-foreground/20"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
