const DATA_URL_RE = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/;

/** Tamanho maximo do arquivo decodificado: 6 MB. */
export const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AllowedMime = (typeof ALLOWED_MIME_TYPES)[number];

export type ImageValidation =
  | { ok: true; mimeType: AllowedMime; base64: string; bytes: number }
  | { ok: false; error: string };

function sniffMime(buffer: Buffer): AllowedMime | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

/**
 * Valida tipo, tamanho e conteudo de uma imagem recebida como Data URL.
 * Confere os "magic bytes" reais, nao apenas o tipo declarado.
 * Nunca lanca excecao: retorna um resultado tipado.
 */
export function validateImageDataUrl(input: unknown): ImageValidation {
  if (typeof input !== "string" || input.length === 0) {
    return { ok: false, error: "Imagem ausente ou em formato invalido." };
  }

  const match = DATA_URL_RE.exec(input);
  if (!match) {
    return {
      ok: false,
      error: "Formato nao suportado. Envie uma imagem JPEG, PNG ou WebP.",
    };
  }

  const declaredMime = match[1] as AllowedMime;
  const base64 = match[2].replace(/\s/g, "");

  let buffer: Buffer;
  try {
    buffer = Buffer.from(base64, "base64");
  } catch {
    return { ok: false, error: "Nao foi possivel decodificar a imagem." };
  }

  if (buffer.length === 0) {
    return { ok: false, error: "A imagem esta vazia." };
  }
  if (buffer.length > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      error: "A imagem e muito grande. O limite e 6 MB.",
    };
  }

  const actualMime = sniffMime(buffer);
  if (!actualMime) {
    return { ok: false, error: "O conteudo do arquivo nao e uma imagem valida." };
  }
  if (actualMime !== declaredMime) {
    return { ok: false, error: "O tipo declarado nao corresponde ao conteudo do arquivo." };
  }

  return { ok: true, mimeType: actualMime, base64, bytes: buffer.length };
}
