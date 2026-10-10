import { describe, expect, it } from "vitest";
import { matchFood, normalizeText } from "./match";

describe("normalizeText", () => {
  it("remove acentos, pontuacao e caixa", () => {
    expect(normalizeText("  Frango, Peito, GRELHADO! ")).toBe("frango peito grelhado");
    expect(normalizeText("Pão Francês")).toBe("pao frances");
  });
});

describe("matchFood", () => {
  it("encontra correspondencia exata case-insensitive", () => {
    const result = matchFood("arroz branco cozido");
    expect(result.reliable).toBe(true);
    expect(result.food?.id).toBe("arroz-branco-cozido");
  });

  it("reconhece termo parcial comum", () => {
    const result = matchFood("Frango grelhado com salada");
    expect(result.reliable).toBe(true);
    expect(result.food?.id).toBe("frango-peito-grelhado");
  });

  it("nao inventa correspondencia quando nao ha base confiavel", () => {
    const result = matchFood("sushi de salmao trufado");
    expect(result.reliable).toBe(false);
    expect(result.food).toBeNull();
  });

  it("retorna invalido para nome vazio", () => {
    const result = matchFood("   ");
    expect(result.reliable).toBe(false);
    expect(result.food).toBeNull();
  });
});
