import { FOOD_DATABASE } from "./taco.data";
import type { FoodRef } from "./schema";

export interface MatchResult {
  /** Melhor alimento encontrado na base, se houver. */
  food: FoodRef | null;
  /** Confianca do casamento (0 a 1). */
  confidence: number;
  /** true apenas quando a correspondencia e considerada confiavel. */
  reliable: boolean;
  /** Explicacao curta e legivel para o usuario. */
  reason: string;
}

/** Limiar a partir do qual consideramos uma correspondencia confiavel. */
export const RELIABLE_THRESHOLD = 0.6;

/** Normaliza texto: minusculas, sem acentos, sem pontuacao, espacos unicos. */
export function normalizeText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(text: string): Set<string> {
  return new Set(text.split(" ").filter(Boolean));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function scoreAgainstKeyword(name: string, keyword: string): number {
  const nn = normalizeText(name);
  const nk = normalizeText(keyword);
  if (!nn || !nk) return 0;
  if (nn === nk) return 1;
  if (nn.includes(nk)) return 0.75;
  if (nk.includes(nn)) return 0.7;
  return jaccard(tokenSet(nn), tokenSet(nk)) * 0.9;
}

/**
 * Casa o nome detectado pela IA com um alimento da base de referencia.
 * Nao inventa resultados: se nada passar do limiar, `reliable` e false.
 */
export function matchFood(name: string): MatchResult {
  if (!name || !normalizeText(name)) {
    return {
      food: null,
      confidence: 0,
      reliable: false,
      reason: "Nome de alimento vazio ou invalido.",
    };
  }

  let best: { food: FoodRef; score: number } | null = null;
  for (const food of FOOD_DATABASE) {
    for (const keyword of food.keywords) {
      const score = scoreAgainstKeyword(name, keyword);
      if (!best || score > best.score) {
        best = { food, score };
      }
    }
  }

  if (!best || best.score < RELIABLE_THRESHOLD) {
    return {
      food: null,
      confidence: best ? Number(best.score.toFixed(2)) : 0,
      reliable: false,
      reason: `Sem correspondencia confiavel na base de referencia para "${name}".`,
    };
  }

  return {
    food: best.food,
    confidence: Number(best.score.toFixed(2)),
    reliable: true,
    reason: `Correspondencia com "${best.food.name}" (confianca ${best.score.toFixed(2)}).`,
  };
}
