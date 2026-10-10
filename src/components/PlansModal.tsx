"use client";

import { useEffect, useRef } from "react";
import { PLANS, type PlanId } from "@/lib/plans";
import { CheckIcon, CloseIcon } from "./icons";

interface PlansModalProps {
  open: boolean;
  currentPlanId: PlanId | null;
  onClose: () => void;
  onSelect: (id: PlanId) => void;
}

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function PlansModal({ open, currentPlanId, onClose, onSelect }: PlansModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFirst = window.setTimeout(() => {
      const node = dialogRef.current;
      if (!node) return;
      const focusables = node.querySelectorAll<HTMLElement>(FOCUSABLE);
      (focusables[0] ?? node).focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const node = dialogRef.current;
      if (!node) return;
      const focusables = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => !element.hasAttribute("disabled"),
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusFirst);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 animate-fade-in bg-brand-900/50 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="planos-titulo"
        aria-describedby="planos-descricao"
        tabIndex={-1}
        className="relative flex max-h-[92vh] w-full max-w-5xl animate-slide-up flex-col overflow-hidden rounded-t-3xl border border-brand-100 bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-brand-100 px-6 py-5">
          <div>
            <h2 id="planos-titulo" className="text-2xl">
              Escolha um plano para analisar
            </h2>
            <p id="planos-descricao" className="mt-1 text-brand-800">
              A análise de fotos é um recurso dos planos pagos. Selecione uma opção para continuar.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-brand-800 transition-colors hover:bg-brand-100"
            aria-label="Fechar a janela de planos"
          >
            <CloseIcon width={22} height={22} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <ul className="grid gap-4 md:grid-cols-3">
            {PLANS.map((plan) => {
              const isCurrent = currentPlanId === plan.id;
              return (
                <li
                  key={plan.id}
                  className={
                    "flex flex-col rounded-3xl border-2 p-5 " +
                    (plan.highlight
                      ? "border-brand-700 bg-brand-50"
                      : "border-brand-100 bg-white")
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl">{plan.name}</h3>
                    {plan.highlight ? (
                      <span className="rounded-full bg-brand-700 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                        Recomendado
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-brand-700">{plan.tagline}</p>

                  <p className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-brand-900">
                      {plan.priceMonthly}
                    </span>
                    <span className="text-brand-700">/mes</span>
                  </p>
                  <p className="mt-1 font-semibold text-brand-800">{plan.analyses}</p>

                  <ul className="mt-4 space-y-2 text-brand-800">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckIcon className="mt-0.5 shrink-0 text-brand-700" width={18} height={18} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => onSelect(plan.id)}
                    className={
                      "mt-5 " +
                      (plan.highlight ? "btn-primary" : "btn-secondary")
                    }
                  >
                    {isCurrent ? "Continuar com este plano" : `Assinar ${plan.name}`}
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-5 text-center text-sm text-brand-700">
            Demonstração: nenhuma cobrança é realizada neste MVP.
          </p>
        </div>

        <div className="border-t border-brand-100 px-6 py-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-base font-semibold text-brand-800 underline underline-offset-4 hover:text-brand-900"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
