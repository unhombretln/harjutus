import type { Express } from "express";
import type { Server } from "http";
import { storage, buildExercisePrompt } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

function zodErrorToResponse(err: z.ZodError) {
  const first = err.errors[0];
  return {
    message: first?.message || "Invalid request",
    field: first?.path?.length ? first.path.join(".") : undefined,
  };
}

async function generateExerciseJson(prompt: string): Promise<{
  title: string;
  instructions: string;
  expectedAnswer?: string;
  teacherTip?: string;
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      {
        role: "system",
        content:
          "You generate safe, age-appropriate classroom micro-exercises for grades 1-4 in Estonia.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 700,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(content);

  return {
    title: String(parsed.title ?? ""),
    instructions: String(parsed.instructions ?? ""),
    expectedAnswer:
      parsed.expectedAnswer !== undefined && parsed.expectedAnswer !== null
        ? String(parsed.expectedAnswer)
        : undefined,
    teacherTip:
      parsed.teacherTip !== undefined && parsed.teacherTip !== null
        ? String(parsed.teacherTip)
        : undefined,
  };
}

async function seedDatabase(): Promise<void> {
  const existing = await storage.listExercises({ limit: 1 });
  if (existing.length > 0) return;

  await storage.createExercise({
    grade: "1",
    subject: "matemaatika",
    difficulty: "baas",
    title: "Numbrite soojendus",
    instructions:
      "Kirjuta tahvlile arvud 1–10. Palu õpilastel plaksutada iga paarisarvu juures. Seejärel küsi: millised arvud jäid vahele?",
    expectedAnswer: "Paarisarvud: 2, 4, 6, 8, 10",
    teacherTip: "Hoia tempot kiire ja rõõmus. Sobib ka seistes.",
  });

  await storage.createExercise({
    grade: "2",
    subject: "loogika",
    difficulty: "baas",
    title: "Jätka mustrit",
    instructions:
      "Ütle järjest: punane, sinine, punane, sinine... Palu õpilastel jätkata veel 6 sõnaga. Seejärel tee uus muster: 1, 2, 4, 1, 2, 4...",
    expectedAnswer: "punane, sinine, punane, sinine, punane, sinine; ja 1, 2, 4, 1, 2, 4",
    teacherTip: "Kui klass on väsinud, tee mustrid plaksu ja sammuga.",
  });

  await storage.createExercise({
    grade: "3",
    subject: "emotsionaalne_soojendus",
    difficulty: "baas",
    title: "Tunne ja hingamine",
    instructions:
      "Seiske püsti. Tehke 3 aeglast sisse- ja väljahingamist. Siis palu igal õpilasel mõttes valida üks sõna: kuidas ma end praegu tunnen? Soovi korral võivad 2–3 last jagada.",
    teacherTip:
      "Rõhuta, et jagamine on vabatahtlik. Hoia toon rahulik ja turvaline.",
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  await seedDatabase();

  app.get(api.exercises.history.path, async (req, res) => {
    const parsed = api.exercises.history.input?.safeParse(req.query);
    if (parsed && !parsed.success) {
      return res.status(400).json(zodErrorToResponse(parsed.error));
    }

    const input = parsed?.success ? parsed.data : undefined;

    const items = await storage.listExercises({
      grade: input?.grade,
      subject: input?.subject,
      difficulty: input?.difficulty,
      limit: input?.limit ?? 10,
    });

    res.json(items);
  });

  app.get(api.exercises.get.path, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(404).json({ message: "Not found" });
    }

    const exercise = await storage.getExercise(id);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    res.json(exercise);
  });

  app.post(api.exercises.generate.path, async (req, res) => {
    try {
      const input = api.exercises.generate.input.parse(req.body);

      const prompt = buildExercisePrompt(input);
      const generated = await generateExerciseJson(prompt);

      if (!generated.title.trim() || !generated.instructions.trim()) {
        return res.status(500).json({ message: "Generation failed" });
      }

      const created = await storage.createExercise({
        grade: input.grade,
        subject: input.subject,
        difficulty: input.difficulty,
        theme: input.theme || null,
        title: generated.title.trim(),
        instructions: generated.instructions.trim(),
        expectedAnswer: generated.expectedAnswer?.trim() || undefined,
        teacherTip: generated.teacherTip?.trim() || undefined,
      });

      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json(zodErrorToResponse(err));
      }
      throw err;
    }
  });

  return httpServer;
}
