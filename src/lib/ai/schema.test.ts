import { describe, expect, it } from "vitest";
import { AiAnalysisSchema } from "./schema";
import { extractJson } from "./provider";

describe("AiAnalysisSchema", () => {
  it("aceita uma analise valida e aplica defaults", () => {
    const parsed = AiAnalysisSchema.parse({
      foods: [{ name: "Arroz", estimatedGrams: 100, confidence: 0.5 }],
    });
    expect(parsed.foods[0].preparation).toEqual([]);
    expect(parsed.uncertainties).toEqual([]);
    expect(parsed.notDeterminable).toEqual([]);
  });

  it("aceita lista de alimentos vazia (a rota trata como 'nenhum alimento identificado')", () => {
    const result = AiAnalysisSchema.safeParse({ foods: [] });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.foods).toEqual([]);
  });

  it("rejeita gramas negativas ou absurdas", () => {
    expect(
      AiAnalysisSchema.safeParse({
        foods: [{ name: "X", estimatedGrams: -5, confidence: 0.5 }],
      }).success,
    ).toBe(false);
    expect(
      AiAnalysisSchema.safeParse({
        foods: [{ name: "X", estimatedGrams: 99999, confidence: 0.5 }],
      }).success,
    ).toBe(false);
  });

  it("rejeita confianca fora de 0..1", () => {
    expect(
      AiAnalysisSchema.safeParse({
        foods: [{ name: "X", estimatedGrams: 100, confidence: 2 }],
      }).success,
    ).toBe(false);
  });
});

describe("extractJson", () => {
  it("interpreta JSON puro", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("remove cercas de codigo", () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("recupera JSON cercado de texto", () => {
    expect(extractJson('Aqui esta: {"a":1} fim')).toEqual({ a: 1 });
  });

  it("lanca erro quando nao ha JSON", () => {
    expect(() => extractJson("sem json aqui")).toThrow();
  });
});
