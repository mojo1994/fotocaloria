import { z } from "zod";

/**
 * Referencia nutricional por 100 g de parte comestivel.
 * Valores de REFERENCIA (nao estimativas da foto).
 */
export const NutrientPer100gSchema = z.object({
  kcal: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
});

export type NutrientPer100g = z.infer<typeof NutrientPer100gSchema>;

export const FoodRefSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /** Termos alternativos para casar com o nome detectado pela IA. */
  keywords: z.array(z.string().min(1)).min(1),
  /** Grupo alimentar, ajuda o usuario a escolher a alternativa correta. */
  group: z.string().min(1),
  per100g: NutrientPer100gSchema,
  /** Origem do dado de referencia. */
  source: z.string().min(1),
});

export type FoodRef = z.infer<typeof FoodRefSchema>;

export const NutrientsSchema = NutrientPer100gSchema;
export type Nutrients = z.infer<typeof NutrientsSchema>;
