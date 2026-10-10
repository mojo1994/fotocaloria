import type { AiAnalysis } from "@/lib/ai/schema";
import { calculateForGrams, sumNutrients } from "@/lib/nutrition/calculate";
import { matchFood } from "@/lib/nutrition/match";
import { findFoodById } from "@/lib/nutrition/taco.data";
import type { Nutrients } from "@/lib/nutrition/schema";
import type { Meal, MealItem } from "@/lib/storage/schema";

export const EMPTY_NUTRIENTS: Nutrients = { kcal: 0, protein: 0, carbs: 0, fat: 0 };

/** Gera um identificador unico, com fallback caso crypto nao exista. */
export function makeId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* fallback abaixo */
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface EditableItem {
  id: string;
  name: string;
  grams: number;
  foodId: string | null;
  /** true quando ha correspondencia confiavel com a base. */
  matched: boolean;
  preparation: string[];
  /** Confianca original atribuida pela IA. */
  confidence: number;
  nutrients: Nutrients;
}

/**
 * Converte a analise da IA em itens editaveis, casando cada alimento com a
 * base de referencia e calculando os nutrientes pela porcao estimada.
 * Itens sem correspondencia confiavel ficam com nutrientes zerados e
 * `matched = false` (o usuario pode escolher um alimento manualmente).
 */
export function buildEditableItems(analysis: AiAnalysis): EditableItem[] {
  return analysis.foods.map((food) => {
    const match = matchFood(food.name);
    const foodRef = match.food;
    const nutrients = foodRef
      ? calculateForGrams(foodRef.per100g, food.estimatedGrams)
      : EMPTY_NUTRIENTS;

    return {
      id: makeId(),
      name: foodRef ? foodRef.name : food.name,
      grams: food.estimatedGrams,
      foodId: foodRef ? foodRef.id : null,
      matched: match.reliable,
      preparation: food.preparation ?? [],
      confidence: food.confidence,
      nutrients,
    };
  });
}

/** Recalcula os nutrientes de um item apos o usuario mudar alimento e/ou gramas. */
export function recalcItem(item: EditableItem, foodId: string | null, grams: number): EditableItem {
  if (!foodId) {
    return { ...item, foodId: null, grams, matched: false, nutrients: EMPTY_NUTRIENTS };
  }
  const foodRef = findFoodById(foodId);
  if (!foodRef) {
    return { ...item, foodId: null, matched: false, nutrients: EMPTY_NUTRIENTS };
  }
  return {
    ...item,
    foodId: foodRef.id,
    name: foodRef.name,
    grams,
    matched: true,
    nutrients: calculateForGrams(foodRef.per100g, grams),
  };
}

/** Soma os nutrientes de todos os itens (cada item entra uma unica vez). */
export function totalsForItems(items: readonly EditableItem[]): Nutrients {
  return sumNutrients(items.map((item) => item.nutrients));
}

/** Converte itens editaveis em um registro de refeicao persistivel. */
export function itemsToMeal(
  items: readonly EditableItem[],
  options: { isDemo: boolean; note?: string; createdAt?: string; id?: string },
): Meal {
  const mealItems: MealItem[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    grams: item.grams,
    foodId: item.foodId,
    matched: item.matched,
    preparation: item.preparation,
    nutrients: item.nutrients,
  }));

  return {
    id: options.id ?? makeId(),
    createdAt: options.createdAt ?? new Date().toISOString(),
    items: mealItems,
    totals: totalsForItems(items),
    isDemo: options.isDemo,
    note: options.note,
  };
}
