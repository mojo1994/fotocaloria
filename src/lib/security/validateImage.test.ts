import { describe, expect, it } from "vitest";
import { validateImageDataUrl } from "./validateImage";

function dataUrl(mime: string, buffer: Buffer): string {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

const png1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);
const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
const webpHeader = Buffer.from("RIFF0000WEBP", "ascii");

describe("validateImageDataUrl", () => {
  it("aceita um PNG valido", () => {
    const result = validateImageDataUrl(dataUrl("image/png", png1x1));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.mimeType).toBe("image/png");
  });

  it("aceita cabeçalho JPEG e WebP validos", () => {
    expect(validateImageDataUrl(dataUrl("image/jpeg", jpegHeader)).ok).toBe(true);
    expect(validateImageDataUrl(dataUrl("image/webp", webpHeader)).ok).toBe(true);
  });

  it("rejeita entradas nao-string e vazias", () => {
    expect(validateImageDataUrl(undefined).ok).toBe(false);
    expect(validateImageDataUrl("").ok).toBe(false);
  });

  it("rejeita formato de data URL invalido", () => {
    expect(validateImageDataUrl("http://exemplo.com/foto.png").ok).toBe(false);
    expect(validateImageDataUrl("data:image/gif;base64,AAAA").ok).toBe(false);
  });

  it("rejeita quando o tipo declarado nao corresponde ao conteudo", () => {
    const result = validateImageDataUrl(dataUrl("image/jpeg", png1x1));
    expect(result.ok).toBe(false);
  });

  it("rejeita conteudo que nao e imagem", () => {
    const result = validateImageDataUrl(dataUrl("image/png", Buffer.from("nao e imagem")));
    expect(result.ok).toBe(false);
  });
});
