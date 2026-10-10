"use client";

import { useRef } from "react";
import { ALLOWED_MIME_TYPES, MAX_IMAGE_BYTES } from "@/lib/security/validateImage";
import { CameraIcon, GalleryIcon } from "./icons";

interface PhotoCaptureProps {
  onSelect: (dataUrl: string) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

const ALLOWED = new Set<string>(ALLOWED_MIME_TYPES);

export function PhotoCapture({ onSelect, onError, disabled }: PhotoCaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    if (!ALLOWED.has(file.type)) {
      onError("Formato não suportado. Use uma foto JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      onError("A foto é muito grande. O limite é 6 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onSelect(reader.result);
      else onError("Não foi possível ler a imagem.");
    };
    reader.onerror = () => onError("Não foi possível ler a imagem.");
    reader.readAsDataURL(file);
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files);
    event.target.value = "";
  }

  return (
    <div className="space-y-4">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleChange}
        aria-hidden="true"
        tabIndex={-1}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      <button
        type="button"
        className="btn-primary"
        disabled={disabled}
        onClick={() => cameraRef.current?.click()}
      >
        <CameraIcon width={26} height={26} />
        Fotografar minha comida
      </button>

      <button
        type="button"
        className="btn-secondary"
        disabled={disabled}
        onClick={() => galleryRef.current?.click()}
      >
        <GalleryIcon width={26} height={26} />
        Escolher foto da galeria
      </button>
    </div>
  );
}
