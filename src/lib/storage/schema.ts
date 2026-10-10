import { z } from "zod";

export const StoredNutrientsSchema = z.object({
  kcal: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
});

export const MealItemSchema = z.object({
  id: z.string().min(1),
  /** Nome exibido (pode ter sido editado pelo usuario). */
  name: z.string().min(1).max(120),
  /** Quantidade em gramas usada no calculo. */
  grams: z.number().min(0).max(5000),
  /** Alimento de referencia escolhido, se houver. */
  foodId: z.string().nullable(),
  /** true quando a correspondencia com a base de referencia e confiavel. */
  matched: z.boolean(),
  preparation: z.array(z.string()).default([]),
  nutrients: StoredNutrientsSchema,
});

export type MealItem = z.infer<typeof MealItemSchema>;

export const MealSchema = z.object({
  id: z.string().min(1),
  /** Data/hora ISO 8601 do registro. */
  createdAt: z.string().min(1),
  items: z.array(MealItemSchema).min(1).max(50),
  totals: StoredNutrientsSchema,
  /** true quando a origem foi o modo demonstracao. */
  isDemo: z.boolean(),
  note: z.string().max(300).optional(),
});

export type Meal = z.infer<typeof MealSchema>;

export const HistorySchema = z.array(MealSchema).max(2000);
export type History = z.infer<typeof HistorySchema>;
