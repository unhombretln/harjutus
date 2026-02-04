import { z } from "zod";
import {
  exercises,
  generateExerciseRequestSchema,
  insertExerciseSchema,
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  exercises: {
    generate: {
      method: "POST" as const,
      path: "/api/exercises/generate",
      input: generateExerciseRequestSchema,
      responses: {
        201: z.custom<typeof exercises.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    history: {
      method: "GET" as const,
      path: "/api/exercises",
      input: z
        .object({
          grade: z.enum(["1", "2", "3", "4"]).optional(),
          subject: z
            .enum(["matemaatika", "loogika", "emotsionaalne_soojendus", "eesti_keel"])
            .optional(),
          difficulty: z.enum(["baas", "raskem"]).optional(),
          limit: z.coerce.number().int().min(1).max(50).optional(),
        })
        .optional(),
      responses: {
        200: z.array(z.custom<typeof exercises.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/exercises/:id",
      responses: {
        200: z.custom<typeof exercises.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  // Optional: if later needed, could add /api/presets etc.
} as const;

export function buildUrl(
  path: string,
  params?: Record<string, string | number>
): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type GenerateExerciseInput = z.infer<typeof api.exercises.generate.input>;
export type ExerciseResponse = z.infer<
  typeof api.exercises.generate.responses[201]
>;
export type ExerciseHistoryResponse = z.infer<
  typeof api.exercises.history.responses[200]
>;
export type ValidationError = z.infer<typeof errorSchemas.validation>;
export type NotFoundError = z.infer<typeof errorSchemas.notFound>;
export type InternalError = z.infer<typeof errorSchemas.internal>;

// Export insert schema for shared form validation when needed
export { insertExerciseSchema };
