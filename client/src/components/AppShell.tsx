import { PropsWithChildren, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { BookOpenCheck, Sparkles, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
    document.documentElement.lang = "et";
    document.title = "Viie minuti harjutused | Õpetaja tööriist";
    setMetaDescription(
      "Genereeri 5-minutilisi harjutusi 1.–4. klassile: matemaatika, loogika ja emotsionaalne soojendus. Vali klass ja raskusaste ning alusta kohe."
    );
  }, []);

  return (
    <div className="min-h-dvh mesh-bg noise-overlay">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-24 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-28 left-8 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-24 right-8 h-64 w-64 rounded-full bg-[hsl(223_74%_56%/0.10)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="pt-6 sm:pt-8">
          <div className="glass shadow-soft rounded-3xl px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="relative mt-0.5">
                  <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl" />
                  <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(223_74%_56%)] text-primary-foreground shadow-lift">
                    <TimerReset className="h-6 w-6" aria-hidden="true" />
                  </div>
                </div>

                <div className="min-w-0">
                  <h1 className="text-balance text-2xl sm:text-3xl md:text-4xl">
                    Viie minuti harjutused
                  </h1>
                  <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                    Kiire, rahulik ja praktiline ideegeneraator 1.–4. klassi õpetajale.
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
                      data-testid="header-quick-tip"
                      onClick={() => {
                        const el = document.getElementById("quick-tip");
                        el?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Kiirnipp
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Vali klass + aine + raskusaste ja vajuta “Genereeri”. Seejärel salvesta lemmikud
                    oma tunniplaani (või kasuta “Hiljutised”).
                  </TooltipContent>
                </Tooltip>

                <Link
                  href="/harjutused"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                    "bg-gradient-to-r from-primary to-[hsl(223_74%_56%)] text-primary-foreground shadow-soft",
                    "hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0",
                    location === "/harjutused" || location === "/"
                      ? "ring-1 ring-primary/25"
                      : "opacity-95"
                  )}
                  data-testid="nav-harjutused"
                >
                  <BookOpenCheck className="h-4 w-4" />
                  Harjutused
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="pb-10 pt-6 sm:pb-14 sm:pt-8">{children}</main>

        <footer className="pb-10">
          <div className="glass rounded-2xl px-4 py-4 sm:px-6 shadow-soft">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Mõeldud kasutamiseks Eesti põhikoolis (1.–4. klass).
              </p>
              <button
                type="button"
                className={cn(
                  "text-sm font-semibold text-foreground/80 transition-colors",
                  "hover:text-foreground focus:outline-none focus:ring-4 focus:ring-primary/15 rounded-xl px-3 py-2"
                )}
                data-testid="scroll-to-top"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Tagasi üles
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
