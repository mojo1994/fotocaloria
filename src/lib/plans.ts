/**
 * Planos de assinatura do FotoCaloria.
 *
 * Observacao (MVP): o pagamento NAO e processado de verdade. A escolha do plano
 * e apenas registrada localmente para liberar a analise. Nenhuma cobranca ocorre.
 */

export type PlanId = "essencial" | "pro" | "ilimitado";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  priceMonthly: string;
  analyses: string;
  highlight: boolean;
  features: string[];
}

export const PLANS: readonly Plan[] = [
  {
    id: "essencial",
    name: "Essencial",
    tagline: "Para começar com o pé direito",
    priceMonthly: "R$ 14,90",
    analyses: "20 análises por mês",
    highlight: false,
    features: [
      "Estimativa de calorias e macronutrientes",
      "Edição de alimentos e porções",
      "Histórico e total diário no aparelho",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "O mais escolhido",
    priceMonthly: "R$ 29,90",
    analyses: "100 análises por mês",
    highlight: true,
    features: [
      "Tudo do Essencial",
      "Análises com prioridade",
      "Correção de porções ilimitada",
      "Suporte por e-mail",
    ],
  },
  {
    id: "ilimitado",
    name: "Ilimitado",
    tagline: "Sem se preocupar com limites",
    priceMonthly: "R$ 49,90",
    analyses: "Análises ilimitadas",
    highlight: false,
    features: [
      "Tudo do Pro",
      "Sem limite mensal de análises",
      "Prioridade máxima na fila de análise",
      "Acesso antecipado a novidades",
    ],
  },
];

export const PLAN_STORAGE_KEY = "fotocaloria:plan:v1";

export function getPlanById(id: string | null | undefined): Plan | null {
  if (!id) return null;
  return PLANS.find((plan) => plan.id === id) ?? null;
}

export function getSelectedPlan(): Plan | null {
  try {
    if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) return null;
    return getPlanById(globalThis.localStorage.getItem(PLAN_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function setSelectedPlan(id: PlanId): void {
  try {
    if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) return;
    globalThis.localStorage.setItem(PLAN_STORAGE_KEY, id);
  } catch {
    /* armazenamento indisponivel */
  }
}

export function clearSelectedPlan(): void {
  try {
    if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) return;
    globalThis.localStorage.removeItem(PLAN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
