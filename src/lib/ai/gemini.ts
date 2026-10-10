import { AiAnalysis, AiAnalysisSchema } from "./schema";
import { VISION_PROMPT, extractJson, type AnalyzeInput, type VisionProvider } from "./provider";

const DEFAULT_MODEL = "gemini-3.5-flash";
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 800;

/** Status que costumam ser temporarios e valem uma nova tentativa. */
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

export interface GeminiConfig {
  apiKey: string;
  model?: string;
}

interface GeminiPart {
  text?: string;
}
interface GeminiCandidate {
  content?: { parts?: GeminiPart[] };
}
interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: { blockReason?: string };
}

/** Erro interno com a informacao de se vale a pena tentar de novo. */
class ProviderError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

function collectText(payload: GeminiResponse): string {
  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  return parts.map((part) => part.text ?? "").join("\n");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Provedor real usando a API multimodal do Google Gemini.
 * A chave NUNCA sai do servidor; este modulo nao deve ser importado no cliente.
 * Faz ate 3 tentativas em erros temporarios (429/5xx/rede).
 */
export function createGeminiProvider(config: GeminiConfig): VisionProvider {
  const model = config.model?.trim() || DEFAULT_MODEL;

  async function attemptOnce(input: AnalyzeInput): Promise<AiAnalysis> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(
        `${ENDPOINT}/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": config.apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: VISION_PROMPT },
                  { inline_data: { mime_type: input.mimeType, data: input.imageBase64 } },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new ProviderError(
          `O provedor de IA retornou status ${response.status}.`,
          RETRYABLE_STATUS.has(response.status),
        );
      }

      const payload = (await response.json()) as GeminiResponse;
      if (payload.promptFeedback?.blockReason) {
        throw new ProviderError("A imagem foi bloqueada pelo provedor de IA.", false);
      }

      const text = collectText(payload);
      if (!text) {
        throw new ProviderError("O provedor de IA não retornou conteúdo.", true);
      }

      return AiAnalysisSchema.parse(extractJson(text));
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      if (error instanceof Error && error.name === "AbortError") {
        throw new ProviderError("A análise excedeu o tempo limite.", true);
      }
      if (error instanceof SyntaxError) {
        throw new ProviderError("A resposta da IA veio em um formato inesperado.", false);
      }
      // Erro de rede (fetch). Vale reter tentativa.
      throw new ProviderError("Falha de conexão com o provedor de IA.", true);
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    id: "gemini",
    isDemo: false,
    async analyze(input: AnalyzeInput): Promise<AiAnalysis> {
      let lastError: ProviderError | null = null;

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        try {
          return await attemptOnce(input);
        } catch (error) {
          lastError = error as ProviderError;
          const retryable = error instanceof ProviderError && error.retryable;
          const isLast = attempt === MAX_ATTEMPTS - 1;
          if (!retryable || isLast) break;
          await sleep(BASE_BACKOFF_MS * 2 ** attempt);
        }
      }

      throw lastError ?? new ProviderError("Não foi possível concluir a análise.", false);
    },
  };
}
