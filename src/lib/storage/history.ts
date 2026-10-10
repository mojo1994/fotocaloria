import { HistorySchema, MealSchema, type Meal } from "./schema";
import { sumNutrients } from "@/lib/nutrition/calculate";
import type { Nutrients } from "@/lib/nutrition/schema";

export const STORAGE_KEY = "fotocaloria:history:v1";

/** Interface minima de armazenamento (compativel com localStorage e com testes). */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Retorna o localStorage quando disponivel; caso contrario, null. */
export function getDefaultStorage(): StorageLike | null {
  try {
    if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
      const storage = (globalThis as { localStorage?: StorageLike }).localStorage;
      if (storage) return storage;
    }
  } catch {
    /* acesso bloqueado (modo privado) */
  }
  return null;
}

/**
 * Le e valida o historico. Dados corrompidos nunca quebram o app:
 * o resultado invalido e descartado silenciosamente (sem logar conteudo).
 */
export function loadHistory(storage: StorageLike | null = getDefaultStorage()): Meal[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = HistorySchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function saveHistory(
  meals: readonly Meal[],
  storage: StorageLike | null = getDefaultStorage(),
): { ok: boolean; error?: string } {
  if (!storage) return { ok: false, error: "Armazenamento indisponivel neste dispositivo." };
  const valid = HistorySchema.safeParse(meals);
  if (!valid.success) return { ok: false, error: "Dados invalidos: nada foi salvo." };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(valid.data));
    return { ok: true };
  } catch {
    return { ok: false, error: "Nao foi possivel salvar (armazenamento cheio ou bloqueado)." };
  }
}

export function addMeal(
  meal: Meal,
  storage: StorageLike | null = getDefaultStorage(),
): { ok: boolean; error?: string; meals: Meal[] } {
  const valid = MealSchema.safeParse(meal);
  if (!valid.success) {
    return { ok: false, error: "Refeicao invalida.", meals: loadHistory(storage) };
  }
  const next = [valid.data, ...loadHistory(storage)];
  const saved = saveHistory(next, storage);
  return { ok: saved.ok, error: saved.error, meals: saved.ok ? next : loadHistory(storage) };
}

export function deleteMeal(
  id: string,
  storage: StorageLike | null = getDefaultStorage(),
): Meal[] {
  const next = loadHistory(storage).filter((meal) => meal.id !== id);
  saveHistory(next, storage);
  return next;
}

export function clearHistory(storage: StorageLike | null = getDefaultStorage()): void {
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Recalcula os totais de uma refeicao a partir dos seus itens. */
export function computeMealTotals(meal: Pick<Meal, "items">): Nutrients {
  return sumNutrients(meal.items.map((item) => item.nutrients));
}

/** Filtra refeicoes por data local (YYYY-MM-DD). */
export function mealsForDate(meals: readonly Meal[], isoDate: string): Meal[] {
  return meals.filter((meal) => meal.createdAt.slice(0, 10) === isoDate);
}

/** Soma os nutrientes de todas as refeicoes de uma data local. */
export function dailyTotals(meals: readonly Meal[], isoDate: string): Nutrients {
  const dayMeals = mealsForDate(meals, isoDate);
  return sumNutrients(dayMeals.map((meal) => meal.totals));
}

/** Data local de hoje no formato YYYY-MM-DD. */
export function todayIso(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
