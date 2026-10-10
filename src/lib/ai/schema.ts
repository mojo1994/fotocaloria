import { z } from "zod";

/** Um alimento detectado pela IA na imagem. */
export const AiDetectedFoodSchema = z.object({
  /** Nome provavel do alimento (o que a IA acha que ve). */
  name: z.string().min(1).max(120),
  /** Quantidade estimada em gramas. Sempre uma estimativa, nunca um fato. */
  estimatedGrams: z.number().positive().max(5000),
  /** Possiveis metodos de preparo (grelhado, frito, assado...). */
  preparation: z.array(z.string().min(1).max(60)).max(6).default([]),
  /** Confianca auto-declarada pela IA (0 a 1). */
  confidence: z.number().min(0).max(1),
  /** Observacao opcional sobre aquele item. */
  notes: z.string().max(300).optional(),
});

export type AiDetectedFood = z.infer<typeof AiDetectedFoodSchema>;

/** Saida bruta esperada do provedor de IA (antes de validacao adicional). */
export const AiAnalysisSchema = z.object({
  // Pode ser vazio: a IA pode nao identificar nenhum alimento na foto.
  // A rota trata esse caso com uma mensagem amigavel (nao e erro de servidor).
  foods: z.array(AiDetectedFoodSchema).max(20),
  /** Incertezas gerais da analise. */
  uncertainties: z.array(z.string().min(1).max(300)).max(20).default([]),
  /** Ingredientes que NAO podem ser determinados visualmente. */
  notDeterminable: z.array(z.string().min(1).max(300)).max(20).default([]),
});

export type AiAnalysis = z.infer<typeof AiAnalysisSchema>;

export const AiSourceSchema = z.enum(["demo", "gemini", "openai"]);
export type AiSource = z.infer<typeof AiSourceSchema>;

/** Resposta final da rota /api/analyze. */
export const AnalyzeResponseSchema = AiAnalysisSchema.extend({
  source: AiSourceSchema,
  /** true quando a resposta e um exemplo ficticio, nao uma analise real. */
  isDemo: z.boolean(),
  /** Aviso de transparencia exibido na interface. */
  disclaimer: z.string().min(1),
  analyzedAt: z.string().min(1),
});

export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;

export const DISCLAIMER =
  "Estimativa gerada automaticamente a partir da foto. Os valores sao aproximados, " +
  "nao substituem avaliacao nutricional e podem nao refletir ingredientes que nao " +
  "aparecem na imagem.";

export const DEMO_DISCLAIMER =
  "MODO DEMONSTRACAO: estes dados sao ficticios, apenas para testar a interface. " +
  "Nenhuma foto foi analisada de verdade.";
