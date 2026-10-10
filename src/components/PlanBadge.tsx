"use client";

import { useEffect, useState } from "react";
import { getSelectedPlan, type Plan } from "@/lib/plans";

/** Mostra o plano ativo no cabecalho. Le o armazenamento local no cliente. */
export function PlanBadge() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPlan(getSelectedPlan());
    setReady(true);
  }, []);

  if (!ready || !plan) return null;

  return (
    <span className="badge" title="Plano ativo neste dispositivo">
      Plano {plan.name}
    </span>
  );
}
