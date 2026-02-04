import { useMemo, useState } from "react";
import { useParams } from "wouter";
import AppShell from "@/components/AppShell";
import { useExercise } from "@/hooks/use-exercises";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Loader2, RefreshCcw, Wand2 } from "lucide-react";
import { Link } from "wouter";
import type { Exercise } from "@shared/schema";
import ExerciseCard from "@/components/ExerciseCard";
import ExerciseDetailsDialog from "@/components/ExerciseDetailsDialog";

export default function ExercisePreviewPage() {
  const params = useParams<{ id: string }>();
  const id = useMemo(() => {
    const n = Number(params?.id);
    return Number.isFinite(n) ? n : null;
  }, [params?.id]);

  const q = useExercise(id);

  const [open, setOpen] = useState(false);
  const [exercise, setExercise] = useState<Exercise | null>(null);

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/harjutused"
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold bg-card border border-border/70 shadow-soft hover:-translate-y-0.5 hover:shadow-lift transition-all duration-200"
              data-testid="preview-back"
            >
              <ArrowLeft className="h-4 w-4" />
              Tagasi
            </Link>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="rounded-2xl"
            data-testid="preview-refetch"
            onClick={() => q.refetch()}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Värskenda
          </Button>
        </div>

        {q.isLoading ? (
          <Card className="rounded-3xl border border-border/70 bg-card p-7 shadow-soft" data-testid="preview-loading">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Laadin harjutust...
            </div>
            <div className="mt-4 space-y-3">
              <div className="h-3 w-2/3 rounded-full shimmer" />
              <div className="h-3 w-1/2 rounded-full shimmer" />
              <div className="h-3 w-5/6 rounded-full shimmer" />
            </div>
          </Card>
        ) : q.isError ? (
          <Alert className="rounded-2xl" variant="destructive" data-testid="preview-error">
            <AlertTitle>Ei saanud harjutust avada</AlertTitle>
            <AlertDescription>{(q.error as Error)?.message ?? "Viga."}</AlertDescription>
          </Alert>
        ) : !q.data ? (
          <Card className="rounded-3xl border border-border/70 bg-card p-7 shadow-soft" data-testid="preview-empty">
            <div className="flex flex-col items-center text-center">
              <div className="grid h-14 w-14 place-items-center rounded-3xl bg-primary/10 text-primary shadow-soft">
                <Wand2 className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-2xl">Harjutust ei leitud</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                Võimalik, et see harjutus on eemaldatud või link on vale.
              </p>
              <Link
                href="/harjutused"
                className="mt-5 inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold bg-gradient-to-r from-primary to-[hsl(223_74%_56%)] text-primary-foreground shadow-soft hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                data-testid="preview-go-home"
              >
                Tagasi harjutuste juurde
              </Link>
            </div>
          </Card>
        ) : (
          <div className="animate-float-in">
            <ExerciseCard
              exercise={q.data as unknown as Exercise}
              variant="hero"
              onOpen={() => {
                setExercise(q.data as unknown as Exercise);
                setOpen(true);
              }}
            />
          </div>
        )}

        <ExerciseDetailsDialog open={open} onOpenChange={setOpen} exercise={exercise} />
      </div>
    </AppShell>
  );
}
