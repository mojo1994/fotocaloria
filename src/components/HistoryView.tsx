"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  clearHistory,
  dailyTotals,
  deleteMeal,
  loadHistory,
  mealsForDate,
  todayIso,
} from "@/lib/storage/history";
import type { Meal, MealItem } from "@/lib/storage/schema";
import type { Nutrients } from "@/lib/nutrition/schema";

const numberFormat = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

function Macros({ nutrients }: { nutrients: Nutrients }) {
  return (
    <p className="mt-1 text-base text-brand-800">
      <strong>{numberFormat.format(nutrients.kcal)} kcal</strong> ·{" "}
      {numberFormat.format(nutrients.protein)} g prote ·{" "}
      {numberFormat.format(nutrients.carbs)} g carb · {numberFormat.format(nutrients.fat)} g gord
    </p>
  );
}

function itemText(item: MealItem): string {
  return `${item.name} (${numberFormat.format(item.grams)} g)`;
}

function formatDateHeader(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function HistoryView() {
  const [meals, setMeals] = useState<Meal[] | null>(null);

  useEffect(() => {
    setMeals(loadHistory());
  }, []);

  const today = todayIso();
  const todayTotal = useMemo(
    () => (meals ? dailyTotals(meals, today) : null),
    [meals, today],
  );
  const todayCount = useMemo(
    () => (meals ? mealsForDate(meals, today).length : 0),
    [meals, today],
  );

  const grouped = useMemo(() => {
    if (!meals) return [];
    const map = new Map<string, Meal[]>();
    for (const meal of meals) {
      const key = meal.createdAt.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(meal);
      map.set(key, list);
    }
    return [...map.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, list]) => ({
        date,
        meals: list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
      }));
  }, [meals]);

  function handleDelete(id: string) {
    setMeals(deleteMeal(id));
  }

  function handleClear() {
    if (typeof window !== "undefined" && !window.confirm("Apagar todo o historico deste aparelho?")) {
      return;
    }
    clearHistory();
    setMeals([]);
  }

  if (meals === null) {
    return (
      <p role="status" aria-live="polite" className="text-brand-800">
        Carregando historico...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Historico de refeicoes</h1>

      <section aria-labelledby="total-hoje" className="card">
        <h2 id="total-hoje" className="text-xl">
          Total de hoje
        </h2>
        {todayTotal && todayCount > 0 ? (
          <>
            <Macros nutrients={todayTotal} />
            <p className="mt-1 text-brand-700">
              {todayCount} refeicao(oes) registrada(s) hoje.
            </p>
          </>
        ) : (
          <p className="mt-2 text-brand-800">Nenhuma refeicao registrada hoje ainda.</p>
        )}
      </section>

      {meals.length === 0 ? (
        <section className="card">
          <p className="text-brand-800">Seu historico esta vazio.</p>
          <p className="mt-2 text-brand-700">
            O historico inicial fica salvo apenas neste dispositivo e pode nao sincronizar
            entre aparelhos.
          </p>
          <Link href="/" className="btn-primary mt-4">
            Fotografar uma refeicao
          </Link>
        </section>
      ) : (
        <>
          {grouped.map((group) => (
            <section key={group.date} aria-labelledby={`dia-${group.date}`}>
              <h2 id={`dia-${group.date}`} className="text-lg capitalize">
                {formatDateHeader(group.date)}
              </h2>
              <ul className="mt-3 space-y-3">
                {group.meals.map((meal) => (
                  <li key={meal.id} className="card">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-brand-900">
                        {new Date(meal.createdAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {meal.isDemo ? (
                          <span className="pill ml-2">Demonstracao</span>
                        ) : null}
                      </p>
                      <button
                        type="button"
                        className="rounded-xl px-3 py-1 text-sm font-semibold text-red-800 hover:bg-red-50"
                        onClick={() => handleDelete(meal.id)}
                        aria-label="Remover esta refeicao do historico"
                      >
                        Remover
                      </button>
                    </div>
                    <p className="mt-2 text-brand-800">
                      {meal.items.map(itemText).join(" · ")}
                    </p>
                    <Macros nutrients={meal.totals} />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <button type="button" className="btn-danger" onClick={handleClear}>
            Apagar todo o historico
          </button>
        </>
      )}
    </div>
  );
}
