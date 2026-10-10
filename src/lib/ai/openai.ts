import { AiAnalysis, AiAnalysisSchema } from "./schema";
import { VISION_PROMPT, extractJson, type AnalyzeInput, type VisionProvider } from "./provider";

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const REQUEST_TIMEOUT_MS = 30_000;

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

interface OpenAIResponse {
  choices?: { message?: { content?: string } }[];
}

/**
 * Provedor real compativel com a API de Chat Completions da OpenAI.
 * Opcional no MVP; o padrao e o Gemini. A chave fica apenas no servidor.
 */
export function createOpenAIProvider(config: OpenAIConfig): VisionProvider {
  const model = config.model?.trim() || DEFAULT_MODEL;
  const baseUrl = (config.baseUrl?.trim() || DEFAULT_BASE_URL).replace(/\/$/, "");

  return {
    id: "openai",
    isDemo: false,
    async analyze(input: AnalyzeInput): Promise<AiAnalysis> {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model,
            temperature: 0.2,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: VISION_PROMPT },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${input.mimeType};base64,${input.imageBase64}`,
                    },
                  },
                ],
              },
            ],
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`O provedor de IA retornou status ${response.status}.`);
        }

        const payload = (await response.json()) as OpenAIResponse;
        const text = payload.choices?.[0]?.message?.content;
        if (!text) {
          throw new Error("O provedor de IA não retornou conteúdo.");
        }

        return AiAnalysisSchema.parse(extractJson(text));
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error("A análise excedeu o tempo limite.");
        }
        throw error;
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
