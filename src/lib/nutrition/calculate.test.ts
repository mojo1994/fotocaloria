import { describe, expect, it } from "vitest";
import { calculateForGrams, round1, sumNutrients } from "./calculate";

describe("calculateForGrams", () => {
  const arroz = { kcal: 128, protein: 2.5, carbs: 28.1, fat: 0.2 };

  it("calcula proporcionalmente a 100 g", () => {
    expect(calculateForGrams(arroz, 100)).toEqual({
      kcal: 128,
      protein: 2.5,
      carbs: 28.1,
      fat: 0.2,
    });
  });

  it("calcula metade da porcao", () => {
    expect(calculateForGrams(arroz, 50)).toEqual({
      kcal: 64,
      protein: 1.3,
      carbs: 14.1,
      fat: 0.1,
    });
  });

  it("trata gramas invalidos como zero (sem valores negativos)", () => {
    expect(calculateForGrams(arroz, -10)).toEqual({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
    expect(calculateForGrams(arroz, Number.NaN)).toEqual({
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
  });
});

describe("sumNutrients", () => {
  it("soma cada item uma unica vez", () => {
    const total = sumNutrients([
      { kcal: 100, protein: 10, carbs: 20, fat: 5 },
      { kcal: 50, protein: 5, carbs: 10, fat: 2.5 },
    ]);
    expect(total).toEqual({ kcal: 150, protein: 15, carbs: 30, fat: 7.5 });
  });

  it("retorna zeros para lista vazia", () => {
    expect(sumNutrients([])).toEqual({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  });
});

describe("round1", () => {
  it("arredonda para uma casa decimal", () => {
    expect(round1(1.24)).toBe(1.2);
    expect(round1(1.25)).toBe(1.3);
    expect(round1(Number.POSITIVE_INFINITY)).toBe(0);
  });
});
