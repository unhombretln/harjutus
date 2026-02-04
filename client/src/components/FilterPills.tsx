import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type Option<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

export function FilterPills<T extends string>({
  label,
  value,
  onChange,
  options,
  testId,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: Option<T>[];
  testId: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-semibold text-foreground/90" data-testid={`${testId}-label`}>
          {label}
        </p>
        <p className="text-xs text-muted-foreground hidden sm:block" data-testid={`${testId}-hint`}>
          Vali üks
        </p>
      </div>

      <div
        className={cn(
          "grid gap-2",
          options.length <= 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3"
        )}
        data-testid={`${testId}-group`}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              data-testid={`${testId}-opt-${opt.value}`}
              className={cn(
                "group relative overflow-hidden rounded-2xl border px-3 py-3 text-left transition-all duration-200",
                "bg-card shadow-[0_10px_30px_hsl(200_30%_20%/0.06)]",
                "hover:-translate-y-0.5 hover:shadow-[0_18px_55px_hsl(200_35%_16%/0.12)]",
                "active:translate-y-0 active:shadow-[0_10px_30px_hsl(200_30%_20%/0.08)]",
                "focus:outline-none focus:ring-4 focus:ring-primary/15",
                active
                  ? "border-primary/40 ring-1 ring-primary/15"
                  : "border-border/70"
              )}
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200",
                  "bg-gradient-to-br from-primary/12 via-transparent to-accent/10",
                  "group-hover:opacity-100",
                  active && "opacity-100"
                )}
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold tracking-tight">{opt.label}</span>
                    {active && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        Valitud
                      </span>
                    )}
                  </div>
                  {opt.description && (
                    <p className="mt-1 text-xs text-muted-foreground leading-snug">
                      {opt.description}
                    </p>
                  )}
                </div>

                <div
                  className={cn(
                    "mt-0.5 grid h-7 w-7 place-items-center rounded-xl border transition-all duration-200",
                    active
                      ? "border-primary/30 bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card text-muted-foreground group-hover:text-foreground"
                  )}
                  aria-hidden="true"
                >
                  <Check className={cn("h-4 w-4", active ? "opacity-100" : "opacity-0")} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
