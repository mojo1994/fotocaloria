import { describe, expect, it } from "vitest";
import {
  buildEditableItems,
  itemsToMeal,
  recalcItem,
  totalsForItems,
} from "./build";
import { AiAnalysisSchema } from "@/lib/ai/schema";

const analysis = AiAnalysisSchema.parse({
  foods: [
    { name: "Arroz branco cozido", estimatedGrams: 100, confidence: 0.8, preparation: ["cozido"] },
    { name: "Comida misteriosa", estimatedGrams: 80, confidence: 0.3 },
  ],
  uncertainties: ["porcao incerta"],
  notDeterminable: ["sal"],
});

describe("buildEditableItems", () => {
  it("casa alimentos e calcula nutrientes pela porcao estimada", () => {
    const items = buildEditableItems(analysis);
    expect(items).toHaveLength(2);
    expect(items[0].foodId).toBe("arroz-branco-cozido");
    expect(items[0].matched).toBe(true);
    expect(items[0].nutrients.kcal).toBe(128);
  });

  it("marca itens sem correspondencia como nao calculados", () => {
    const items = buildEditableItems(analysis);
    expect(items[1].matched).toBe(false);
    expect(items[1].foodId).toBeNull();
    expect(items[1].nutrients).toEqual({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  });

  it("nao duplica itens ao somar totais", () => {
    const items = buildEditableItems(analysis);
    const totals = totalsForItems(items);
    expect(totals.kcal).toBe(128);
  });
});

describe("recalcItem", () => {
  it("recalcula ao trocar o alimento e a quantidade", () => {
    const [first] = buildEditableItems(analysis);
    const updated = recalcItem(first, "frango-peito-grelhado", 200);
    expect(updated.foodId).toBe("frango-peito-grelhado");
    expect(updated.nutrients.kcal).toBe(318); // 159 * 2
    expect(updated.nutrients.protein).toBe(64);
  });

  it("zera nutrientes quando o alimento e removido", () => {
    const [first] = buildEditableItems(analysis);
    const updated = recalcItem(first, null, 100);
    expect(updated.matched).toBe(false);
    expect(updated.nutrients.kcal).toBe(0);
  });
});

describe("itemsToMeal", () => {
  it("monta uma refeicao valida com totais coerentes", () => {
    const items = buildEditableItems(analysis);
    const meal = itemsToMeal(items, { isDemo: true });
    expect(meal.items).toHaveLength(2);
    expect(meal.totals.kcal).toBe(128);
    expect(meal.isDemo).toBe(true);
    expect(meal.id).toBeTruthy();
  });
});
