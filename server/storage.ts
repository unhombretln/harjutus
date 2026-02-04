import { db } from "./db";
import {
  exercises,
  type GenerateExerciseRequest,
  type ExerciseResponse,
  type Subject,
  type Difficulty,
} from "@shared/schema";
import { and, desc, eq } from "drizzle-orm";

export interface IStorage {
  createExercise(exercise: Omit<ExerciseResponse, "id" | "createdAt">): Promise<ExerciseResponse>;
  getExercise(id: number): Promise<ExerciseResponse | undefined>;
  listExercises(filter?: {
    grade?: string;
    subject?: Subject;
    difficulty?: Difficulty;
    limit?: number;
  }): Promise<ExerciseResponse[]>;
}

export class DatabaseStorage implements IStorage {
  async createExercise(
    exercise: Omit<ExerciseResponse, "id" | "createdAt">,
  ): Promise<ExerciseResponse> {
    const [created] = await db.insert(exercises).values(exercise).returning();
    return created;
  }

  async getExercise(id: number): Promise<ExerciseResponse | undefined> {
    const [row] = await db.select().from(exercises).where(eq(exercises.id, id));
    return row;
  }

  async listExercises(filter?: {
    grade?: string;
    subject?: Subject;
    difficulty?: Difficulty;
    limit?: number;
  }): Promise<ExerciseResponse[]> {
    const conditions = [];
    if (filter?.grade) conditions.push(eq(exercises.grade, filter.grade));
    if (filter?.subject) conditions.push(eq(exercises.subject, filter.subject));
    if (filter?.difficulty) conditions.push(eq(exercises.difficulty, filter.difficulty));

    const where = conditions.length ? and(...conditions) : undefined;

    const limit = filter?.limit ?? 10;

    const q = db
      .select()
      .from(exercises)
      .where(where)
      .orderBy(desc(exercises.createdAt))
      .limit(limit);

    return await q;
  }
}

export const storage = new DatabaseStorage();

export function buildExercisePrompt(input: GenerateExerciseRequest): string {
  const gradeLabel = `klass: ${input.grade}`;
  const difficultyLabel = input.difficulty === "baas" ? "Baas" : "Raskem";

  const subjectText =
    input.subject === "matemaatika"
      ? "Matemaatika"
      : input.subject === "loogika"
        ? "Loogika"
        : "Emotsionaalne soojendus";

  return [
    "Sa oled Eesti algkooli (1–4 klass) õpetaja abiline.",
    "Genereeri ÜKS lühike 5-minutiline harjutus õpilastele.",
    "Harjutus peab olema eesti keeles, lihtsa ja selge sõnastusega.",
    "Ära kasuta emotikone.",
    "Vältida keerulist tausta või pikkasid tekste.",
    "Valikud: ${gradeLabel}, aine: ${subjectText}, raskus: ${difficultyLabel}.",
    "Sinu ülesanne on luua harjutus järgmiste reeglite järgi:",
    "- Matemaatika: Ainult kirjalik või suuline vastamine (arvutamine, tekstülesanne). Ei mingit liikumist ega emotsionaalseid teemasid.",
    "- Loogika: Segatüüpi (liikumine või kirjalik/suuline). Mõistatused, mustrid, järjestused.",
    "- Emotsionaalne soojendus: Ainult tunnete, enesetunde, lõdvestumise ja sotsiaalsete oskustega seotud harjutused (nt hingamine, tänulikkus, vaikuseminutid). MITTE mingit matemaatikat ega arvutamist selles aines.",
    "Väljund peab olema rangelt JSON (ilma markdownita) järgmise skeemi järgi:",
    JSON.stringify(
      {
        title: "Lühike pealkiri",
        instructions: "Kuni ~6 lühikest lauset / sammud",
        expectedAnswer: "Valikuline: kui on konkreetne vastus või kontroll",
        teacherTip: "Valikuline: 1-2 lühikest soovitust õpetajale",
      },
      null,
      2,
    ),
    "Reeglid:",
    "- Matemaatika: väikesed arvud ja klassile sobiv tase.",
    "- Loogika: mustrid, võrdlused, järjestused, lühike mõistatus.",
    "- Emotsionaalne soojendus: turvalised, positiivsed, lühikesed küsimused/harjutused (nt hingamine, tänulikkus, tunne-sõnad).",
    "- Ei mingeid isikuandmeid ega tundlikke teemasid.",
  ].join("\n");
}
