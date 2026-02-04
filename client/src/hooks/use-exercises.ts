import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type {
  ExerciseHistoryResponse,
  ExerciseResponse,
  GenerateExerciseInput,
  ValidationError,
} from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export type ExercisesHistoryParams = NonNullable<
  z.infer<typeof api.exercises.history.input>
>;

export function useExerciseHistory(params?: ExercisesHistoryParams) {
  return useQuery({
    queryKey: [api.exercises.history.path, params ?? {}],
    queryFn: async () => {
      const validated = api.exercises.history.input.safeParse(params);
      if (!validated.success) {
        console.error("[Zod] exercises.history input invalid:", validated.error.format());
        throw validated.error;
      }

      const qs = new URLSearchParams();
      const v = validated.data ?? undefined;
      if (v?.grade) qs.set("grade", v.grade);
      if (v?.subject) qs.set("subject", v.subject);
      if (v?.difficulty) qs.set("difficulty", v.difficulty);
      if (typeof v?.limit === "number") qs.set("limit", String(v.limit));

      const url = qs.toString()
        ? `${api.exercises.history.path}?${qs.toString()}`
        : api.exercises.history.path;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Harjutuste ajalugu ei õnnestunud laadida.");
      const json = await res.json();
      return parseWithLogging(
        api.exercises.history.responses[200],
        json,
        "exercises.history.responses[200]"
      ) as ExerciseHistoryResponse;
    },
  });
}

export function useExercise(id: number | null) {
  return useQuery({
    queryKey: [api.exercises.get.path, id ?? "null"],
    enabled: typeof id === "number",
    queryFn: async () => {
      const url = buildUrl(api.exercises.get.path, { id: id as number });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Harjutust ei õnnestunud laadida.");
      const json = await res.json();
      return parseWithLogging(
        api.exercises.get.responses[200],
        json,
        "exercises.get.responses[200]"
      );
    },
  });
}

export function useGenerateExercise() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: GenerateExerciseInput) => {
      const validated = api.exercises.generate.input.safeParse(input);
      if (!validated.success) {
        console.error("[Zod] exercises.generate input invalid:", validated.error.format());
        throw validated.error;
      }

      const res = await fetch(api.exercises.generate.path, {
        method: api.exercises.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated.data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const errJson = await res.json().catch(() => ({}));
          const parsed = api.exercises.generate.responses[400].safeParse(errJson);
          const msg = parsed.success
            ? (parsed.data as ValidationError).message
            : "Sisend ei sobi.";
          throw new Error(msg);
        }
        throw new Error("Genereerimine ebaõnnestus. Proovi uuesti.");
      }

      const json = await res.json();
      return parseWithLogging(
        api.exercises.generate.responses[201],
        json,
        "exercises.generate.responses[201]"
      ) as ExerciseResponse;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [api.exercises.history.path] });
    },
  });
}
