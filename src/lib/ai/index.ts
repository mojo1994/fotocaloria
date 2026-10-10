import { demoProvider } from "./demo";
import { createGeminiProvider } from "./gemini";
import { createOpenAIProvider } from "./openai";
import type { VisionProvider } from "./provider";

export type { VisionProvider, AnalyzeInput } from "./provider";

/**
 * Seleciona o provedor de IA com base nas variaveis de ambiente do SERVIDOR.
 *
 * Regras (seguras por padrao):
 * - AI_PROVIDER=gemini  -> usa Gemini (exige GEMINI_API_KEY/GOOGLE_API_KEY).
 * - AI_PROVIDER=openai  -> usa OpenAI (exige OPENAI_API_KEY).
 * - AI_PROVIDER=demo    -> sempre demonstracao.
 * - Sem definir        -> usa um provedor real se houver chave; senao, demo.
 * - Provedor pedido sem chave -> demonstracao (nunca finge sucesso real).
 */
export function getProvider(env: NodeJS.ProcessEnv = process.env): VisionProvider {
  const requested = (env.AI_PROVIDER ?? "").trim().toLowerCase();
  const model = env.AI_MODEL?.trim() || undefined;
  const geminiKey = (env.GEMINI_API_KEY || env.GOOGLE_API_KEY || "").trim();
  const openaiKey = (env.OPENAI_API_KEY || "").trim();

  const gemini = () => createGeminiProvider({ apiKey: geminiKey, model });
  const openai = () =>
    createOpenAIProvider({ apiKey: openaiKey, model, baseUrl: env.OPENAI_BASE_URL });

  switch (requested) {
    case "gemini":
      return geminiKey ? gemini() : demoProvider;
    case "openai":
      return openaiKey ? openai() : demoProvider;
    case "demo":
      return demoProvider;
    case "":
      if (geminiKey) return gemini();
      if (openaiKey) return openai();
      return demoProvider;
    default:
      return demoProvider;
  }
}
