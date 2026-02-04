import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { FilterPills } from "@/components/FilterPills";
import ExerciseCard from "@/components/ExerciseCard";
import ExerciseDetailsDialog from "@/components/ExerciseDetailsDialog";
import { useExerciseHistory, useGenerateExercise } from "@/hooks/use-exercises";
import type { GenerateExerciseInput } from "@shared/routes";
import type { Exercise } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCcw, Sparkles, Loader2, Wand2, List, BookOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Grade = GenerateExerciseInput["grade"];
type Subject = GenerateExerciseInput["subject"];
type Difficulty = GenerateExerciseInput["difficulty"];

const gradeOptions: { value: Grade; label: string; description: string }[] = [
  { value: "1", label: "1", description: "Alustame rahulikult" },
  { value: "2", label: "2", description: "Kindlamad sammud" },
  { value: "3", label: "3", description: "Rohkem seoseid" },
  { value: "4", label: "4", description: "Julgelt edasi" },
];

const subjectOptions: { value: Subject; label: string; description: string }[] = [
  { value: "matemaatika", label: "Matemaatika", description: "Arvud, mõõtmine, mustrid" },
  { value: "eesti_keel", label: "Eesti keel", description: "Sõnad, mängud, keelekümblus" },
  { value: "loogika", label: "Loogika", description: "Mõtlemine, tähelepanu, reeglid" },
  { value: "emotsionaalne_soojendus", label: "Emotsionaalne", description: "Meelerahu, suhted, enesetunne" },
];

const difficultyOptions: { value: Difficulty; label: string; description: string }[] = [
  { value: "baas", label: "Baas", description: "Kiire ja kindel" },
  { value: "raskem", label: "Raskem", description: "Väike väljakutse" },
];

const themesBySubject: Record<Subject, string[]> = {
  matemaatika: ["Arvutamine", "Tekstülesanded", "Geomeetria", "Mõõtmine", "Kell"],
  loogika: ["Mustrid", "Mõistatused", "Järjestamine", "Võrdlemine", "Ruumiline taju"],
  emotsionaalne_soojendus: ["Hingamine", "Tänulikkus", "Tunnete märkamine", "Sõbralikkus", "Vaikuseminutid"],
  eesti_keel: ["Õigekiri", "Sõnamängud", "Lauseõpetus", "Sõnavara", "Lugemine"],
};

function subjectLabel(subject: Subject) {
  switch (subject) {
    case "matemaatika":
      return "Matemaatika";
    case "loogika":
      return "Loogika";
    case "eesti_keel":
      return "Eesti keel";
    case "emotsionaalne_soojendus":
      return "Emotsionaalne soojendus";
  }
}

export default function ExercisesPage() {
  const [grade, setGrade] = useState<Grade>("2");
  const [subject, setSubject] = useState<Subject>("matemaatika");
  const [difficulty, setDifficulty] = useState<Difficulty>("baas");
  const [theme, setTheme] = useState<string>("all");

  const [generated, setGenerated] = useState<Exercise | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsExercise, setDetailsExercise] = useState<Exercise | null>(null);

  const generate = useGenerateExercise();
  const history = useExerciseHistory({ grade, subject, difficulty, limit: 10 });

  const subtitle = useMemo(() => {
    return `${grade}. klass • ${subjectLabel(subject)} • ${difficulty === "baas" ? "Baas" : "Raskem"}${theme !== "all" ? ` • ${theme}` : ""}`;
  }, [grade, subject, difficulty, theme]);

  const currentThemes = useMemo(() => themesBySubject[subject], [subject]);

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <section className="space-y-6">
          <Card className="glass shadow-soft rounded-3xl p-5 sm:p-7" data-testid="generator-panel">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl" data-testid="generator-title">
                  Genereeri uus harjutus
                </h2>
                <p className="mt-1 text-sm text-muted-foreground" data-testid="generator-subtitle">
                  {subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-2xl"
                  data-testid="generator-reset"
                  onClick={() => {
                    setGrade("2");
                    setSubject("matemaatika");
                    setDifficulty("baas");
                    setTheme("all");
                    setGenerated(null);
                  }}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Lähtesta
                </Button>

                <Button
                  type="button"
                  className={cn(
                    "rounded-2xl px-5",
                    "bg-gradient-to-r from-primary to-[hsl(223_74%_56%)] text-primary-foreground",
                    "shadow-soft hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0",
                    "transition-all duration-200"
                  )}
                  data-testid="generator-generate"
                  onClick={() => {
                    generate.mutate(
                      { grade, subject, difficulty, theme: theme === "all" ? undefined : theme },
                      {
                        onSuccess: (ex) => {
                          setGenerated(ex as unknown as Exercise);
                        },
                      }
                    );
                  }}
                  disabled={generate.isPending}
                >
                  {generate.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Genereerin...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Genereeri
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-5" data-testid="generator-filters">
              <FilterPills
                label="Klass"
                value={grade}
                onChange={setGrade}
                options={gradeOptions}
                testId="filter-grade"
              />
              <FilterPills
                label="Aine"
                value={subject}
                onChange={(s) => {
                  setSubject(s as Subject);
                  setTheme("all");
                }}
                options={subjectOptions}
                testId="filter-subject"
              />
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground/70 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Teema (valikuline)
                </label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="rounded-2xl border-border/70 bg-background/50" data-testid="select-theme">
                    <SelectValue placeholder="Vali teema" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all">Kõik teemad</SelectItem>
                    {currentThemes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <FilterPills
                label="Raskusaste"
                value={difficulty}
                onChange={setDifficulty}
                options={difficultyOptions}
                testId="filter-difficulty"
              />
            </div>

            <Separator className="my-6" />

            <div id="quick-tip" className="rounded-3xl border border-border/70 bg-background/55 p-4 sm:p-5" data-testid="quick-tip">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-2xl bg-accent/15 text-accent shadow-[0_10px_30px_hsl(28_92%_58%/0.12)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground/90" data-testid="quick-tip-title">
                    Kiirnipp klassiruumi jaoks
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed" data-testid="quick-tip-body">
                    Kui rühm on rahutu, vali “Emotsionaalne soojendus” ja “Baas”. Kui energia on
                    madal, vali “Loogika” ja “Raskem” – lühike väljakutse tõstab fookust.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4" data-testid="generated-section">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl" data-testid="generated-title">
                  Viimati genereeritud
                </h3>
                <p className="text-sm text-muted-foreground" data-testid="generated-hint">
                  Siin on sinu värskeim 5-minutiline idee.
                </p>
              </div>
            </div>

            {!generated ? (
              <Card
                className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-soft"
                data-testid="generated-empty"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="grid h-14 w-14 place-items-center rounded-3xl bg-primary/10 text-primary shadow-[0_18px_55px_hsl(188_85%_38%/0.14)]">
                    <Wand2 className="h-7 w-7" />
                  </div>
                  <h4 className="mt-4 text-xl">Valmis, kui sina oled valmis</h4>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
                    Vali klass, aine ja raskusaste ning vajuta “Genereeri”. Saad juhised, vajadusel
                    vastuse ning õpetaja nipi.
                  </p>
                  <Button
                    type="button"
                    className="mt-5 rounded-2xl bg-gradient-to-r from-primary to-[hsl(223_74%_56%)] text-primary-foreground shadow-soft hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                    data-testid="generated-empty-generate"
                    onClick={() => {
                      generate.mutate(
                        { grade, subject, difficulty, theme: theme === "all" ? undefined : theme },
                        { onSuccess: (ex) => setGenerated(ex as unknown as Exercise) }
                      );
                    }}
                    disabled={generate.isPending}
                  >
                    {generate.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Genereerin...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Genereeri esimene
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="animate-float-in">
                <ExerciseCard
                  exercise={generated}
                  variant="hero"
                  onOpen={(id) => {
                    setDetailsExercise(generated);
                    setDetailsOpen(true);
                  }}
                />
              </div>
            )}

            {generate.isError && (
              <Alert className="rounded-2xl" variant="destructive" data-testid="generate-error">
                <AlertTitle>Midagi läks valesti</AlertTitle>
                <AlertDescription>
                  {(generate.error as Error)?.message ?? "Genereerimine ebaõnnestus."}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </section>

        <aside className="space-y-4" id="history" data-testid="history-section">
          <Card className="glass shadow-soft rounded-3xl p-5 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg sm:text-xl" data-testid="history-title">
                  Hiljutised
                </h3>
                <p className="mt-1 text-sm text-muted-foreground" data-testid="history-subtitle">
                  Viimased 10 harjutust sama filtriga.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="rounded-2xl"
                data-testid="history-refetch"
                onClick={() => history.refetch()}
              >
                <List className="mr-2 h-4 w-4" />
                Värskenda
              </Button>
            </div>

            <Separator className="my-5" />

            {history.isLoading ? (
              <div className="space-y-3" data-testid="history-loading">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft"
                  >
                    <div className="h-3 w-2/3 rounded-full shimmer" />
                    <div className="mt-3 h-3 w-1/2 rounded-full shimmer" />
                    <div className="mt-3 h-3 w-5/6 rounded-full shimmer" />
                  </div>
                ))}
              </div>
            ) : history.isError ? (
              <Alert className="rounded-2xl" variant="destructive" data-testid="history-error">
                <AlertTitle>Laadimine ebaõnnestus</AlertTitle>
                <AlertDescription>
                  {(history.error as Error)?.message ?? "Ei saanud ajalugu laadida."}
                </AlertDescription>
              </Alert>
            ) : (history.data?.length ?? 0) === 0 ? (
              <div className="rounded-2xl border border-border/70 bg-card p-5 text-center shadow-soft" data-testid="history-empty">
                <p className="text-sm font-semibold">Siin on veel tühi</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Genereeri üks harjutus, et ajalugu täituks.
                </p>
                <Button
                  type="button"
                  className="mt-4 rounded-2xl bg-gradient-to-r from-primary to-[hsl(223_74%_56%)] text-primary-foreground shadow-soft hover:shadow-lift hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  data-testid="history-empty-generate"
                  onClick={() => {
                    generate.mutate(
                      { grade, subject, difficulty, theme: theme === "all" ? undefined : theme },
                      { onSuccess: (ex) => setGenerated(ex as unknown as Exercise) }
                    );
                  }}
                  disabled={generate.isPending}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Genereeri nüüd
                </Button>
              </div>
            ) : (
              <div className="space-y-3" data-testid="history-list">
                {history.data!.map((ex) => (
                  <div key={ex.id} className="animate-float-in">
                    <ExerciseCard
                      exercise={ex as unknown as Exercise}
                      variant="list"
                      onOpen={(id) => {
                        setDetailsExercise(ex as unknown as Exercise);
                        setDetailsOpen(true);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="rounded-3xl border border-border/70 bg-card p-5 sm:p-7 shadow-soft" data-testid="print-card">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 grid h-11 w-11 place-items-center rounded-2xl bg-[hsl(223_74%_56%/0.12)] text-[hsl(223_74%_56%)] shadow-[0_18px_55px_hsl(223_74%_56%/0.10)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-lg" data-testid="print-title">
                  Nipp: kiire väljatrükk
                </h4>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed" data-testid="print-body">
                  Ava harjutus, kopeeri tekst ning kleebi oma tunnikavasse või töölehele. Hoia “Hiljutised”
                  lahti – see on su “varuideede” riiul.
                </p>

                <Button
                  type="button"
                  variant="secondary"
                  className="mt-4 rounded-2xl"
                  data-testid="print-action"
                  onClick={() => {
                    const el = document.getElementById("generator-panel");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  Tagasi generaatori juurde
                </Button>
              </div>
            </div>
          </Card>
        </aside>
      </div>

      <ExerciseDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        exercise={detailsExercise}
      />
    </AppShell>
  );
}
