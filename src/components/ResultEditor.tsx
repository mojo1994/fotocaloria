"use client";

import { useMemo } from "react";
import { listFoods } from "@/lib/nutrition/taco.data";
import { recalcItem, totalsForItems, type EditableItem } from "@/lib/meal/build";

interface ResultEditorProps {
  items: EditableItem[];
  uncertainties: string[];
  notDeterminable: string[];
  disclaimer: string;
  isDemo: boolean;
  source: string;
  saved: boolean;
  onChange: (items: EditableItem[]) => void;
  onSave: () => void;
  onDiscard: () => void;
}

const numberFormat = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

function fmt(value: number): string {
  return numberFormat.format(value);
}

function MacroSummary({ kcal, protein, carbs, fat }: EditableItem["nutrients"]) {
  return (
    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-base sm:grid-cols-4">
      <div>
        <dt className="text-brand-700">Calorias</dt>
        <dd className="font-semibold text-brand-900">{fmt(kcal)} kcal</dd>
      </div>
      <div>
        <dt className="text-brand-700">Proteinas</dt>
        <dd className="font-semibold text-brand-900">{fmt(protein)} g</dd>
      </div>
      <div>
        <dt className="text-brand-700">Carboidratos</dt>
        <dd className="font-semibold text-brand-900">{fmt(carbs)} g</dd>
      </div>
      <div>
        <dt className="text-brand-700">Gorduras</dt>
        <dd className="font-semibold text-brand-900">{fmt(fat)} g</dd>
      </div>
    </dl>
  );
}

export function ResultEditor(props: ResultEditorProps) {
  const {
    items,
    uncertainties,
    notDeterminable,
    disclaimer,
    isDemo,
    source,
    saved,
    onChange,
    onSave,
    onDiscard,
  } = props;

  const foodOptions = useMemo(
    () => [...listFoods()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [],
  );

  const totals = useMemo(() => totalsForItems(items), [items]);

  function updateItem(id: string, updater: (item: EditableItem) => EditableItem) {
    onChange(items.map((item) => (item.id === id ? updater(item) : item)));
  }

  return (
    <section aria-labelledby="resultado-titulo" className="space-y-5">
      <div className="card">
        <h2 id="resultado-titulo" className="text-xl">
          Resultado da analise
        </h2>

        {isDemo ? (
          <p className="mt-3 rounded-xl border-2 border-amber-400 bg-amber-50 p-3 text-amber-900">
            <strong>Modo demonstracao.</strong> Os alimentos abaixo sao exemplos ficticios, sem
            analise real da sua foto. Configure uma chave de IA para usar a analise real.
          </p>
        ) : (
          <p className="mt-3 rounded-xl border border-brand-100 bg-brand-50 p-3 text-brand-800">
            Analise feita pelo provedor <strong>{source}</strong>. Valores sao estimativas.
          </p>
        )}

        <p className="mt-3 text-brand-800">{disclaimer}</p>
      </div>

      {items.length === 0 ? (
        <p role="status" className="rounded-2xl bg-white p-4 text-brand-800 shadow-sm">
          Nenhum alimento na lista. Adicione uma foto novamente para recomecar.
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((item, index) => {
            const foodFieldId = `food-${item.id}`;
            const gramsFieldId = `grams-${item.id}`;
            return (
              <li key={item.id} className="card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg">{item.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="pill">
                      {item.matched ? "Na base de referencia" : "Sem correspondencia"}
                    </span>
                    <button
                      type="button"
                      className="rounded-xl px-3 py-1 text-sm font-semibold text-red-800 hover:bg-red-50"
                      onClick={() => onChange(items.filter((it) => it.id !== item.id))}
                      aria-label={`Remover ${item.name}`}
                    >
                      Remover
                    </button>
                  </div>
                </div>

                {!item.matched ? (
                  <p className="mt-2 rounded-xl border border-amber-300 bg-amber-50 p-2 text-sm text-amber-900">
                    Nao encontramos &quot;{item.name}&quot; com seguranca na base. Escolha um alimento
                    equivalente abaixo para calcular, ou mantenha sem calculo.
                  </p>
                ) : null}

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={foodFieldId} className="field-label">
                      Alimento de referencia
                    </label>
                    <select
                      id={foodFieldId}
                      className="field-input"
                      value={item.foodId ?? ""}
                      onChange={(event) =>
                        updateItem(item.id, (it) =>
                          recalcItem(it, event.target.value || null, it.grams),
                        )
                      }
                    >
                      <option value="">Sem calculo (nao encontrado)</option>
                      {foodOptions.map((food) => (
                        <option key={food.id} value={food.id}>
                          {food.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor={gramsFieldId} className="field-label">
                      Quantidade estimada (gramas)
                    </label>
                    <input
                      id={gramsFieldId}
                      className="field-input"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={5000}
                      step={1}
                      value={item.grams}
                      onChange={(event) => {
                        const grams = Math.max(
                          0,
                          Math.min(5000, Number(event.target.value) || 0),
                        );
                        updateItem(item.id, (it) => recalcItem(it, it.foodId, grams));
                      }}
                    />
                  </div>
                </div>

                {item.preparation.length > 0 ? (
                  <p className="mt-3 text-base text-brand-800">
                    <span className="font-semibold">Preparo provavel:</span>{" "}
                    {item.preparation.join(", ")}
                  </p>
                ) : null}

                <MacroSummary {...item.nutrients} />
                <p className="mt-2 text-sm text-brand-700">
                  Confianca da deteccao (itens {index + 1}):{" "}
                  {Math.round(item.confidence * 100)}%. Corrija os valores acima se necessario.
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <div className="card" aria-live="polite">
        <h2 className="text-xl">Total desta refeicao</h2>
        <MacroSummary {...totals} />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="btn-primary"
            onClick={onSave}
            disabled={items.length === 0 || saved}
          >
            {saved ? "Refeicao salva" : "Salvar refeicao"}
          </button>
          <button type="button" className="btn-secondary" onClick={onDiscard}>
            Descartar e tirar outra foto
          </button>
        </div>
      </div>

      {uncertainties.length > 0 || notDeterminable.length > 0 ? (
        <div className="card">
          <h2 className="text-lg">Incertezas desta analise</h2>
          {uncertainties.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-6 text-brand-800">
              {uncertainties.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          ) : null}
          {notDeterminable.length > 0 ? (
            <>
              <h3 className="mt-4 text-base">Nao e possivel determinar pela foto</h3>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-brand-800">
                {notDeterminable.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
