import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { Exercise } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Copy, Eye, EyeOff, Lightbulb, ShieldCheck, TimerReset } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function subjectLabel(subject: Exercise["subject"]) {
  switch (subject) {
    case "matemaatika":
      return "Matemaatika";
    case "loogika":
      return "Loogika";
    case "eesti_keel":
      return "Eesti keel";
    case "emotsionaalne_soojendus":
      return "Emotsionaalne soojendus";
    default:
      return subject;
  }
}

function difficultyLabel(d: Exercise["difficulty"]) {
  return d === "baas" ? "Baas" : "Raskem";
}

export default function ExerciseCard({
  exercise,
  variant = "hero",
  onOpen,
}: {
  exercise: Exercise;
  variant?: "hero" | "list";
  onOpen?: (id: number) => void;
}) {
  const { toast } = useToast();
  const [showAnswer, setShowAnswer] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);

  const created = useMemo(() => {
    const dt = new Date(exercise.createdAt as unknown as string);
    if (Number.isNaN(dt.getTime())) return null;
    return new Intl.DateTimeFormat("et-EE", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(dt);
  }, [exercise.createdAt]);

  const headerTone =
    exercise.subject === "matemaatika"
      ? "from-primary/18 to-[hsl(223_74%_56%/0.14)]"
      : exercise.subject === "loogika"
        ? "from-[hsl(223_74%_56%/0.18)] to-primary/10"
        : "from-accent/16 to-primary/10";

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-3xl border-card-border bg-card shadow-soft",
        "transition-all duration-300 hover:shadow-lift hover:-translate-y-0.5",
        variant === "list" ? "p-4 sm:p-5" : "p-5 sm:p-7"
      )}
      data-testid={variant === "hero" ? "generated-exercise-card" : `exercise-card-${exercise.id}`}
    >
      <div className={cn("absolute inset-0 opacity-[0.9]")}>
        <div className={cn("absolute inset-0 bg-gradient-to-br", headerTone)} />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/70 to-transparent dark:from-black/20" />
      </div>

      <div className="relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2" data-testid="exercise-meta">
              <Badge
                className="rounded-full border border-primary/20 bg-primary/10 text-primary hover:bg-primary/15"
                data-testid="exercise-badge-subject"
              >
                {subjectLabel(exercise.subject)}
              </Badge>
              <Badge
                className="rounded-full border border-border bg-background/60 text-foreground/80 hover:bg-background/70"
                data-testid="exercise-badge-grade"
              >
                {exercise.grade}. klass
              </Badge>
              <Badge
                className={cn(
                  "rounded-full border",
                  exercise.difficulty === "baas"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                    : "border-amber-500/20 bg-amber-500/10 text-amber-800"
                )}
                data-testid="exercise-badge-difficulty"
              >
                {difficultyLabel(exercise.difficulty)}
              </Badge>
              {exercise.theme && (
                <Badge
                  className="rounded-full border border-accent/20 bg-accent/10 text-accent hover:bg-accent/15"
                  data-testid="exercise-badge-theme"
                >
                  {exercise.theme}
                </Badge>
              )}
            </div>

            <h2
              className={cn(
                "mt-3 text-balance",
                variant === "hero" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
              )}
              data-testid="exercise-title"
            >
              {exercise.title}
            </h2>

            {created && (
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground" data-testid="exercise-createdat">
                {created}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              className="rounded-2xl"
              onClick={async () => {
                const text = `${exercise.title}\n\n${exercise.instructions}`;
                await navigator.clipboard.writeText(text);
                toast({ title: "Kopeeritud", description: "Harjutus on lõikelaual." });
              }}
              data-testid="exercise-copy"
            >
              <Copy className="mr-2 h-4 w-4" />
              Kopeeri
            </Button>

            <Button
              type="button"
              className="rounded-2xl bg-gradient-to-r from-primary to-[hsl(223_74%_56%)] text-primary-foreground shadow-soft hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              onClick={() => onOpen?.(exercise.id)}
              data-testid="exercise-open"
            >
              <TimerReset className="mr-2 h-4 w-4" />
              Ava
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
          <div className="space-y-3">
            <div
              className={cn(
                "rounded-2xl border border-border/70 bg-background/50 p-4 sm:p-5",
                "shadow-[0_10px_30px_hsl(200_30%_20%/0.05)]"
              )}
              data-testid="exercise-instructions"
            >
              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {exercise.instructions}
              </p>
            </div>

            {exercise.teacherTip && (
              <Collapsible open={tipOpen} onOpenChange={setTipOpen}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold" data-testid="teacher-tip-label">
                    <Lightbulb className="h-4 w-4 text-accent" />
                    Õpetaja nipp
                  </div>

                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      className="rounded-2xl"
                      data-testid="teacher-tip-toggle"
                      onClick={() => setTipOpen((v) => !v)}
                    >
                      {tipOpen ? "Peida" : "Näita"}
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="mt-2">
                  <div
                    className="rounded-2xl border border-border/70 bg-card p-4 text-sm text-foreground/90 shadow-soft animate-float-in"
                    data-testid="teacher-tip-content"
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{exercise.teacherTip}</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>

          <div className="md:sticky md:top-6">
            <div className="w-full md:w-[19rem] space-y-3">
              <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold" data-testid="answer-label">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Vastus
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-2xl"
                    data-testid="answer-toggle"
                    onClick={() => setShowAnswer((v) => !v)}
                    disabled={!exercise.expectedAnswer}
                  >
                    {showAnswer ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Peida
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Näita
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-3">
                  {!exercise.expectedAnswer ? (
                    <p className="text-sm text-muted-foreground" data-testid="answer-empty">
                      Sellel harjutusel pole fikseeritud vastust.
                    </p>
                  ) : showAnswer ? (
                    <div
                      className="rounded-xl border border-border/70 bg-background/60 p-3 text-sm whitespace-pre-wrap leading-relaxed animate-float-in"
                      data-testid="answer-content"
                    >
                      {exercise.expectedAnswer}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border/70 bg-background/60 p-3" data-testid="answer-hidden">
                      <div className="h-3 w-4/5 rounded-full shimmer" />
                      <div className="mt-2 h-3 w-3/5 rounded-full shimmer" />
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full rounded-2xl border-border/80 bg-background/60",
                  "hover:bg-background hover:-translate-y-0.5 hover:shadow-soft transition-all duration-200"
                )}
                data-testid="exercise-scroll-history"
                onClick={() => {
                  const el = document.getElementById("history");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Vaata hiljutisi
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
