import { beforeEach, describe, expect, it } from "vitest";
import {
  addMeal,
  computeMealTotals,
  dailyTotals,
  deleteMeal,
  loadHistory,
  saveHistory,
  type StorageLike,
} from "./history";
import type { Meal } from "./schema";

class MemoryStorage implements StorageLike {
  private map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
}

function makeMeal(overrides: Partial<Meal> = {}): Meal {
  return {
    id: "meal-1",
    createdAt: "2026-01-15T12:00:00.000Z",
    isDemo: false,
    items: [
      {
        id: "item-1",
        name: "Arroz branco cozido",
        grams: 100,
        foodId: "arroz-branco-cozido",
        matched: true,
        preparation: ["cozido"],
        nutrients: { kcal: 128, protein: 2.5, carbs: 28.1, fat: 0.2 },
      },
    ],
    totals: { kcal: 128, protein: 2.5, carbs: 28.1, fat: 0.2 },
    ...overrides,
  };
}

describe("historico local", () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  it("comeca vazio", () => {
    expect(loadHistory(storage)).toEqual([]);
  });

  it("salva e recarrega uma refeicao", () => {
    const result = addMeal(makeMeal(), storage);
    expect(result.ok).toBe(true);
    const loaded = loadHistory(storage);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe("meal-1");
  });

  it("prepende refeicoes novas", () => {
    addMeal(makeMeal({ id: "a" }), storage);
    addMeal(makeMeal({ id: "b" }), storage);
    expect(loadHistory(storage).map((meal) => meal.id)).toEqual(["b", "a"]);
  });

  it("descarta dados corrompidos sem quebrar", () => {
    storage.setItem("fotocaloria:history:v1", "{ isso nao e json }");
    expect(loadHistory(storage)).toEqual([]);
  });

  it("rejeita refeicao invalida", () => {
    const invalid = makeMeal({ items: [] });
    const result = addMeal(invalid, storage);
    expect(result.ok).toBe(false);
    expect(loadHistory(storage)).toEqual([]);
  });

  it("remove uma refeicao por id", () => {
    addMeal(makeMeal({ id: "a" }), storage);
    addMeal(makeMeal({ id: "b" }), storage);
    expect(deleteMeal("a", storage).map((meal) => meal.id)).toEqual(["b"]);
  });

  it("calcula o total diario pela data local", () => {
    const day1 = makeMeal({ id: "a", createdAt: "2026-01-15T12:00:00" });
    const day2 = makeMeal({
      id: "b",
      createdAt: "2026-01-16T12:00:00",
      totals: { kcal: 100, protein: 1, carbs: 1, fat: 1 },
    });
    expect(dailyTotals([day1, day2], "2026-01-15").kcal).toBe(128);
    expect(dailyTotals([day1, day2], "2026-01-16").kcal).toBe(100);
  });

  it("recalcula os totais a partir dos itens", () => {
    const meal = makeMeal();
    expect(computeMealTotals(meal)).toEqual(meal.totals);
  });

  it("recusa salvar lista com refeicao invalida", () => {
    const result = saveHistory([{ id: "" } as unknown as Meal], storage);
    expect(result.ok).toBe(false);
  });
});
