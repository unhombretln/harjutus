import type { Exercise } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function subjectLabel(subject: Exercise["subject"]) {
  switch (subject) {
    case "matemaatika":
      return "Matemaatika";
    case "loogika":
      return "Loogika";
    case "emotsionaalne_soojendus":
      return "Emotsionaalne soojendus";
    default:
      return subject;
  }
}

export default function ExerciseDetailsDialog({
  open,
  onOpenChange,
  exercise,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  exercise: Exercise | null;
}) {
  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl rounded-3xl border border-border/70 bg-card p-0 shadow-lift overflow-hidden"
        data-testid="exercise-details-dialog"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/16 via-transparent to-accent/12" />
          <div className="relative p-5 sm:p-7">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <DialogTitle className="text-2xl sm:text-3xl" data-testid="exercise-details-title">
                    {exercise?.title ?? "Harjutus"}
                  </DialogTitle>
                  <div className="mt-3 flex flex-wrap items-center gap-2" data-testid="exercise-details-badges">
                    {exercise && (
                      <>
                        <Badge className="rounded-full border border-primary/20 bg-primary/10 text-primary">
                          {subjectLabel(exercise.subject)}
                        </Badge>
                        <Badge className="rounded-full border border-border bg-background/60 text-foreground/80">
                          {exercise.grade}. klass
                        </Badge>
                        <Badge className="rounded-full border border-border bg-background/60 text-foreground/80">
                          {exercise.difficulty === "baas" ? "Baas" : "Raskem"}
                        </Badge>
                        {exercise.theme && (
                          <Badge className="rounded-full border border-accent/20 bg-accent/10 text-accent">
                            {exercise.theme}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-2xl"
                    data-testid="exercise-details-copy"
                    onClick={async () => {
                      if (!exercise) return;
                      await navigator.clipboard.writeText(
                        `${exercise.title}\n\n${exercise.instructions}\n\n${exercise.teacherTip ? `Õpetaja nipp:\n${exercise.teacherTip}\n\n` : ""}${
                          exercise.expectedAnswer ? `Vastus:\n${exercise.expectedAnswer}` : ""
                        }`
                      );
                      toast({ title: "Kopeeritud", description: "Detailid on lõikelaual." });
                    }}
                    disabled={!exercise}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Kopeeri
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-2xl"
                    data-testid="exercise-details-close"
                    onClick={() => onOpenChange(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-5 space-y-4">
              <section className="rounded-2xl border border-border/70 bg-background/55 p-4 sm:p-5" data-testid="exercise-details-instructions">
                <h3 className="text-sm font-semibold text-foreground/90">Juhised</h3>
                <p className="mt-2 text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
                  {exercise?.instructions ?? "—"}
                </p>
              </section>

              <div className="grid gap-4 sm:grid-cols-2">
                <section className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-soft" data-testid="exercise-details-tip">
                  <h3 className="text-sm font-semibold text-foreground/90">Õpetaja nipp</h3>
                  <p className="mt-2 text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
                    {exercise?.teacherTip ?? "—"}
                  </p>
                </section>

                <section className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-soft" data-testid="exercise-details-answer">
                  <h3 className="text-sm font-semibold text-foreground/90">Oodatav vastus</h3>
                  <p className="mt-2 text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
                    {exercise?.expectedAnswer ?? "—"}
                  </p>
                </section>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-2xl"
                  data-testid="exercise-details-close-bottom"
                  onClick={() => onOpenChange(false)}
                >
                  Sulge
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
