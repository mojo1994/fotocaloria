import type { AiAnalysis, AiSource } from "./schema";

export interface AnalyzeInput {
  /** Imagem em base64 PURO (sem o prefixo "data:...;base64,"). */
  imageBase64: string;
  /** Tipo MIME validado (image/jpeg | image/png | image/webp). */
  mimeType: string;
}

export interface VisionProvider {
  /** Identificador do provedor (tambem usado como `source` na resposta). */
  readonly id: AiSource;
  /** true quando NAO ha analise real (dados ficticios). */
  readonly isDemo: boolean;
  analyze(input: AnalyzeInput): Promise<AiAnalysis>;
}

/**
 * Instrucao enviada ao modelo multimodal. Reforca limites explicitos:
 * estimar, nao inventar e sinalizar o que nao da para ver.
 */
export const VISION_PROMPT = [
  "Você analisa fotos de refeições para um app de estimativa nutricional.",
  "Olhe a imagem e liste os alimentos visíveis como um JSON válido.",
  "Regras obrigatórias:",
  "- Dê um nome PROVÁVEL para cada alimento.",
  "- Estime a quantidade em gramas. É uma ESTIMATIVA, nunca um valor exato.",
  "- Liste possíveis métodos de preparo (ex.: grelhado, frito, cozido, assado).",
  "- Em 'uncertainties', liste dúvidas sobre a análise.",
  "- Em 'notDeterminable', liste ingredientes que NÃO podem ser vistos",
  "  (ex.: sal, açúcar, óleo usado no preparo, temperos).",
  "- NUNCA afirme que a foto revela ingredientes invisíveis.",
  "- Se não reconhecer nada comestível, ainda assim responda no formato pedido",
  "  com o que conseguir observar.",
  "Formato EXATO (somente o JSON, sem texto extra):",
  '{"foods":[{"name":"string","estimatedGrams":0,"preparation":["string"],"confidence":0.0,"notes":"string"}],"uncertainties":["string"],"notDeterminable":["string"]}',
].join("\n");

/** Extrai JSON de uma resposta de texto, tolerando cercas de codigo ```json. */
export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const withoutFences = trimmed
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(withoutFences);
  } catch {
    const start = withoutFences.indexOf("{");
    const end = withoutFences.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(withoutFences.slice(start, end + 1));
    }
    throw new Error("Não foi possível interpretar a resposta da IA como JSON.");
  }
}
