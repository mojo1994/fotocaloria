import type { NutrientPer100g, Nutrients } from "./schema";

/** Arredonda para 1 casa decimal, evitando caos de ponto flutuante. */
export function round1(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 10) / 10;
}

/**
 * Calcula os nutrientes de uma porcao a partir dos valores de referencia por 100 g.
 * A proporcao e linear: nutriente = per100g * (gramas / 100).
 * Gramas invalidos ou negativos resultam em zero (nunca em valor negativo).
 */
export function calculateForGrams(per100g: NutrientPer100g, grams: number): Nutrients {
  const safeGrams = Number.isFinite(grams) && grams > 0 ? grams : 0;
  const factor = safeGrams / 100;
  return {
    kcal: round1(per100g.kcal * factor),
    protein: round1(per100g.protein * factor),
    carbs: round1(per100g.carbs * factor),
    fat: round1(per100g.fat * factor),
  };
}

/** Soma uma lista de nutrientes. Cada item entra UMA vez (sem contagem dupla). */
export function sumNutrients(items: readonly Nutrients[]): Nutrients {
  const total = items.reduce<Nutrients>(
    (acc, item) => ({
      kcal: acc.kcal + item.kcal,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
  return {
    kcal: round1(total.kcal),
    protein: round1(total.protein),
    carbs: round1(total.carbs),
    fat: round1(total.fat),
  };
}
