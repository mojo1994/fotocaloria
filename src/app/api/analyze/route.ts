import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getProvider } from "@/lib/ai";
import {
  AnalyzeResponseSchema,
  DEMO_DISCLAIMER,
  DISCLAIMER,
} from "@/lib/ai/schema";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { validateImageDataUrl } from "@/lib/security/validateImage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  image: z.string().min(1),
});

/** Limite do corpo da requisicao: base64 de 6 MB + margem do JSON. */
const MAX_BODY_BYTES = 9 * 1024 * 1024;

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Informa o modo atual do servidor (demo ou provedor real), sem expor chaves. */
export async function GET() {
  const provider = getProvider();
  return NextResponse.json({ provider: provider.id, isDemo: provider.isDemo });
}

export async function POST(request: NextRequest) {
  const limit = positiveInt(process.env.ANALYZE_RATE_LIMIT, 10);
  const windowSeconds = positiveInt(process.env.ANALYZE_RATE_WINDOW_SECONDS, 60);
  const rate = checkRateLimit(clientIp(request), {
    limit,
    windowMs: windowSeconds * 1000,
  });

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Muitas análises em pouco tempo. Aguarde e tente novamente." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Requisição muito grande." }, { status: 413 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const body = BodySchema.safeParse(json);
  if (!body.success) {
    return NextResponse.json({ error: "Dados ausentes ou inválidos." }, { status: 400 });
  }

  const image = validateImageDataUrl(body.data.image);
  if (!image.ok) {
    return NextResponse.json({ error: image.error }, { status: 400 });
  }

  const provider = getProvider();

  try {
    const analysis = await provider.analyze({
      imageBase64: image.base64,
      mimeType: image.mimeType,
    });

    if (analysis.foods.length === 0) {
      return NextResponse.json(
        {
          error:
            "Nenhum alimento foi identificado nesta foto. Tente uma imagem mais nítida, " +
            "com o prato bem iluminado e visível por completo.",
        },
        { status: 422 },
      );
    }

    const response = AnalyzeResponseSchema.parse({
      ...analysis,
      source: provider.id,
      isDemo: provider.isDemo,
      disclaimer: provider.isDemo ? DEMO_DISCLAIMER : DISCLAIMER,
      analyzedAt: new Date().toISOString(),
    });

    return NextResponse.json(response, { status: 200 });
  } catch {
    // Nao registramos imagem nem dados pessoais nos logs.
    console.error("[analyze] falha ao processar a análise de imagem.");
    return NextResponse.json(
      { error: "Não foi possível concluir a análise agora. Tente novamente em instantes." },
      { status: 502 },
    );
  }
}
