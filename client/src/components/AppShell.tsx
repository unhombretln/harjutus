import { PropsWithChildren, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Activity, HeartPulse, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

function setMetaDescription(content: string) {
  const existing = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (existing) {
    existing.setAttribute("content", content);
    return;
  }
  const meta = document.createElement("meta");
  meta.name = "description";
  meta.content = content;
  document.head.appendChild(meta);
}

export default function AppShell({ children }: PropsWithChildren) {
  const [location] = useLocation();

  useEffect(() => {
    document.documentElement.lang = "ru";
    document.title = "Health Tracker | Аналитика TCX/GPX";
    setMetaDescription(
      "Загружайте GPX/TCX файлы тренировок и получайте сводку: дистанция, продолжительность, темп, пульс, набор высоты."
    );
  }, []);

  return (
    <div className="min-h-dvh mesh-bg noise-overlay">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-24 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="pt-6 sm:pt-8">
          <div className="glass shadow-soft rounded-3xl px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="relative mt-0.5">
                  <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl" />
                  <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(223_74%_56%)] text-primary-foreground shadow-lift">
                    <HeartPulse className="h-6 w-6" aria-hidden="true" />
                  </div>
                </div>

                <div className="min-w-0">
                  <h1 className="text-balance text-2xl sm:text-3xl md:text-4xl">Health Tracker</h1>
                  <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                    Импорт тренировок из TCX/GPX и базовая аналитика здоровья.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      className="rounded-2xl"
                      onClick={() => {
                        const el = document.getElementById("upload-zone");
                        el?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Загрузить
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Поддерживаются файлы .gpx и .tcx. Метрики считаются локально в браузере.
                  </TooltipContent>
                </Tooltip>

                <Link
                  href="/health"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                    "bg-gradient-to-r from-primary to-[hsl(223_74%_56%)] text-primary-foreground shadow-soft",
                    "hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0",
                    location === "/health" || location === "/" ? "ring-1 ring-primary/25" : "opacity-95"
                  )}
                >
                  <Activity className="h-4 w-4" />
                  Дашборд
                </Link>

                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main className="pb-10 pt-6 sm:pb-14 sm:pt-8">{children}</main>
      </div>
    </div>
  );
}
