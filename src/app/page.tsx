"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnalysisStatus, ErrorMessage } from "@/components/AnalysisStatus";
import { PhotoCapture } from "@/components/PhotoCapture";
import { PlansModal } from "@/components/PlansModal";
import { ResultEditor } from "@/components/ResultEditor";
import { AnalyzeResponseSchema, type AnalyzeResponse } from "@/lib/ai/schema";
import { buildEditableItems, itemsToMeal, type EditableItem } from "@/lib/meal/build";
import { getSelectedPlan, setSelectedPlan, type PlanId } from "@/lib/plans";
import { addMeal } from "@/lib/storage/history";

type Phase = "idle" | "preview" | "analyzing" | "result" | "error";

interface ServerMode {
  provider: string;
  isDemo: boolean;
}

const STEPS = [
  { title: "Tire a foto", text: "Fotografe o prato ou escolha uma imagem da galeria." },
  { title: "Confira a estimativa", text: "Veja alimentos, porcoes e macronutrientes." },
  { title: "Ajuste e salve", text: "Corrija o que quiser e registre no historico." },
];

export default function HomePage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [items, setItems] = useState<EditableItem[]>([]);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [serverMode, setServerMode] = useState<ServerMode | null>(null);
  const [showPlans, setShowPlans] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<PlanId | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPlanId(getSelectedPlan()?.id ?? null);
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/analyze")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active && data && typeof data.isDemo === "boolean") {
          setServerMode({ provider: String(data.provider), isDemo: data.isDemo });
        }
      })
      .catch(() => {
        /* status do servidor e opcional */
      });
    return () => {
      active = false;
    };
  }, []);

  const resetAll = useCallback(() => {
    setPhase("idle");
    setImageDataUrl(null);
    setItems([]);
    setAnalysis(null);
    setErrorMessage("");
    setSaved(false);
  }, []);

  const handleSelect = useCallback((dataUrl: string) => {
    setImageDataUrl(dataUrl);
    setAnalysis(null);
    setItems([]);
    setSaved(false);
    setErrorMessage("");
    setPhase("preview");
  }, []);

  const handleClientError = useCallback((message: string) => {
    setErrorMessage(message);
    setPhase("error");
  }, []);

  const analyze = useCallback(async () => {
    if (!imageDataUrl) return;
    setPhase("analyzing");
    setErrorMessage("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageDataUrl }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Nao foi possivel concluir a analise.");
      }

      const raw = await response.json();
      const parsed = AnalyzeResponseSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error("A resposta da analise veio em um formato inesperado.");
      }

      setAnalysis(parsed.data);
      setItems(buildEditableItems(parsed.data));
      setPhase("result");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel concluir a analise. Tente novamente.",
      );
      setPhase("error");
      queueMicrotask(() => errorRef.current?.focus());
    }
  }, [imageDataUrl]);

  const handleAskToAnalyze = useCallback(() => {
    if (!imageDataUrl) return;
    setShowPlans(true);
  }, [imageDataUrl]);

  const handleSelectPlan = useCallback(
    (id: PlanId) => {
      setSelectedPlan(id);
      setCurrentPlanId(id);
      setShowPlans(false);
      void analyze();
    },
    [analyze],
  );

  const handleSave = useCallback(() => {
    if (items.length === 0 || !analysis) return;
    const meal = itemsToMeal(items, { isDemo: analysis.isDemo });
    const result = addMeal(meal);
    if (result.ok) {
      setSaved(true);
    } else {
      setErrorMessage(result.error ?? "Nao foi possivel salvar a refeicao.");
      setPhase("error");
    }
  }, [items, analysis]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <h1 className="text-3xl leading-tight sm:text-4xl">
              Fotografe a refeicao e veja calorias e macronutrientes
            </h1>
            <p className="mt-3 text-lg text-brand-800">
              Uma estimativa transparente a partir da imagem. Voce pode corrigir cada alimento e
              porcao antes de salvar no seu historico.
            </p>

            {serverMode?.isDemo ? (
              <p
                role="note"
                className="mt-5 rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 text-amber-900"
              >
                <strong>Modo demonstracao ativo.</strong> Nenhuma foto sera analisada de verdade
                enquanto nao houver uma chave de IA configurada no servidor. Os resultados serao
                exemplos ficticios e identificados como tal.
              </p>
            ) : null}
          </div>

          <figure className="order-first lg:order-last">
            <video
              className="mx-auto h-auto max-h-[520px] w-auto"
              src="/demo/video.mp4"
              autoPlay
              muted
              loop
              playsInline
              aria-label="Demonstracao do FotoCaloria."
            />
          </figure>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="rounded-2xl bg-brand-50 p-4">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-700 text-sm font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-3 text-base">{step.title}</h3>
              <p className="mt-1 text-sm text-brand-800">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {phase === "idle" ? (
        <section aria-labelledby="inicio-titulo" className="card space-y-5">
          <div>
            <h2 id="inicio-titulo" className="text-xl">
              Comecar
            </h2>
            <p className="mt-1 text-brand-800">
              Escolha como enviar a foto. Nada e enviado para servicos externos sem a sua acao.
            </p>
          </div>
          <PhotoCapture onSelect={handleSelect} onError={handleClientError} />
        </section>
      ) : null}

      {phase !== "idle" && imageDataUrl ? (
        <section aria-labelledby="preview-titulo" className="card space-y-5">
          <h2 id="preview-titulo" className="text-xl">
            Foto selecionada
          </h2>
          <div className="overflow-hidden rounded-2xl border border-brand-100 bg-brand-50">
            <Image
              src={imageDataUrl}
              alt="Pre-visualizacao da refeicao selecionada"
              width={800}
              height={600}
              unoptimized
              className="mx-auto h-auto max-h-[420px] w-full object-contain"
            />
          </div>

          {phase === "preview" || phase === "error" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" className="btn-primary" onClick={handleAskToAnalyze}>
                Analisar foto
              </button>
              <button type="button" className="btn-secondary" onClick={resetAll}>
                Trocar foto
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {phase === "analyzing" ? (
        <AnalysisStatus message="Analisando a foto. Isso pode levar alguns segundos..." />
      ) : null}

      {phase === "error" ? (
        <div ref={errorRef} tabIndex={-1} className="space-y-3">
          <ErrorMessage
            message={errorMessage}
            onRetry={imageDataUrl ? handleAskToAnalyze : undefined}
          />
          <button type="button" className="btn-secondary" onClick={resetAll}>
            Escolher outra foto
          </button>
        </div>
      ) : null}

      {phase === "result" && analysis ? (
        <>
          {saved ? (
            <div role="status" className="card border-2 border-brand-700">
              <h2 className="text-xl">Refeicao salva neste dispositivo</h2>
              <p className="mt-2 text-brand-800">
                O historico inicial fica salvo apenas neste aparelho e pode nao sincronizar entre
                dispositivos.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link href="/history" className="btn-primary">
                  Ver historico e total diario
                </Link>
                <button type="button" className="btn-secondary" onClick={resetAll}>
                  Fotografar outra refeicao
                </button>
              </div>
            </div>
          ) : null}

          <ResultEditor
            items={items}
            uncertainties={analysis.uncertainties}
            notDeterminable={analysis.notDeterminable}
            disclaimer={analysis.disclaimer}
            isDemo={analysis.isDemo}
            source={analysis.source}
            saved={saved}
            onChange={setItems}
            onSave={handleSave}
            onDiscard={resetAll}
          />
        </>
      ) : null}

      <PlansModal
        open={showPlans}
        currentPlanId={currentPlanId}
        onClose={() => setShowPlans(false)}
        onSelect={handleSelectPlan}
      />
    </div>
  );
}
