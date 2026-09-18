"use client";
import { AlertCircle, Check, Pencil, Info } from "lucide-react";
import { NumberField, SectionTitle } from "@/components/ui";
import { average, difference, safeResult } from "@/lib/calculations";
import { variation, warnings } from "@/lib/validation";
import { circumferenceLabels, dateLabel, fmt, siteLabels } from "@/lib/format";
import {
  CIRCUMFERENCES,
  type CircumferenceKey,
  type Draft,
  type FitnessLevel,
  type Sex,
} from "@/types";
type Props = {
  draft: Draft;
  update: (changes: Partial<Draft>) => void;
  onFocus?: (site: string) => void;
};
export function BasicData({ draft: d, update }: Props) {
  return (
    <>
      <SectionTitle
        title="O ponto de partida."
        sub="Confira os dados do cliente para esta avaliação."
      />
      <div className="protocol-banner">
        <span className="protocol-icon">
          <Check size={18} />
        </span>
        <div>
          <strong>Jackson & Pollock · 7 dobras</strong>
          <p>Masculino · 18 a 61 anos · Conversão de Siri</p>
        </div>
        <span className="tag">PROTOCOLO</span>
      </div>
      <div className="form-grid">
        <label className="field">
          <span>Data da avaliação *</span>
          <input
            type="date"
            required
            value={d.date}
            onChange={(e) => update({ date: e.target.value })}
          />
        </label>
        <NumberField
          label="Idade na avaliação"
          unit="anos"
          required
          value={d.age}
          onChange={(v) => update({ age: v ?? 0 })}
        />
        <NumberField
          label="Peso corporal"
          unit="kg"
          required
          value={d.weight}
          onChange={(v) => update({ weight: v ?? 0 })}
        />
        <NumberField
          label="Altura"
          unit="m"
          required
          value={d.height}
          onChange={(v) => update({ height: v ?? 0 })}
        />
        <label className="field">
          <span>Sexo *</span>
          <select
            value={d.sex}
            onChange={(e) => update({ sex: e.target.value as Sex })}
          >
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
            <option value="other">Outro / não informado</option>
          </select>
        </label>
        <label className="field">
          <span>Nível de condicionamento</span>
          <select
            value={d.fitness}
            onChange={(e) =>
              update({ fitness: e.target.value as FitnessLevel })
            }
          >
            {["Iniciante", "Ativo", "Atleta"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        <span>
          Observações <small>opcional</small>
        </span>
        <textarea
          placeholder="Contexto da avaliação, condições da coleta, observações..."
          rows={4}
          value={d.notes}
          onChange={(e) => update({ notes: e.target.value })}
        />
      </label>
      <p className="input-tip">
        <Info size={15} />
        Condicionamento é uma informação descritiva. Este protocolo não utiliza
        etnia no cálculo.
      </p>
    </>
  );
}
export function Skinfolds({ draft: d, update, onFocus }: Props) {
  const complete = d.skinfolds.filter((m) => average(m) !== null).length;
  const sum =
    complete === 7 ? d.skinfolds.reduce((s, m) => s + average(m)!, 0) : null;
  return (
    <>
      <SectionTitle
        title="Precisão em cada dobra."
        sub="Registre três leituras por local. As médias são calculadas na hora."
        action={<span className="tag">{complete}/7 LOCAIS</span>}
      />
      <div className="skinfold-column-labels">
        <span>LOCAL DE MEDIÇÃO</span>
        <span>1ª LEITURA</span>
        <span>2ª LEITURA</span>
        <span>3ª LEITURA</span>
        <span>MÉDIA</span>
      </div>
      <div className="skinfold-list">
        {d.skinfolds.map((m, i) => {
          const warn = variation(m);
          return (
            <div
              className={`skinfold-row ${warn ? "has-warning" : ""}`}
              key={m.site}
            >
              <div className="skinfold-site">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <strong>{siteLabels[m.site]}</strong>
                {average(m) !== null && <Check size={13} />}
              </div>
              {m.readings.map((v, j) => (
                <NumberField
                  key={j}
                  label={`${siteLabels[m.site]} · leitura ${j + 1}`}
                  unit="mm"
                  value={v}
                  required
                  onFocus={() => onFocus?.(m.site)}
                  onChange={(value) =>
                    update({
                      skinfolds: d.skinfolds.map((x) =>
                        x.site === m.site
                          ? {
                              ...x,
                              readings: x.readings.map((r, k) =>
                                k === j ? value : r,
                              ) as typeof x.readings,
                            }
                          : x,
                      ),
                    })
                  }
                />
              ))}
              <div className="reading-average">
                {fmt(average(m))}
                <small>mm</small>
              </div>
              {warn && (
                <p className="measurement-warning">
                  <AlertCircle size={13} />
                  {warn}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="sum-bar">
        <span>
          Soma das médias <small>7 dobras cutâneas</small>
        </span>
        <strong>
          {fmt(sum)} <small>mm</small>
        </strong>
      </div>
      <p className="input-tip">
        <kbd>Tab</kbd> ou <kbd>Enter</kbd> para avançar · Os valores aceitam
        vírgula ou ponto decimal.
      </p>
    </>
  );
}
const groups: { title: string; subtitle: string; keys: CircumferenceKey[] }[] =
  [
    {
      title: "Tronco",
      subtitle: "Estrutura superior e região central",
      keys: ["trunk", "chest", "waist", "abdomen", "hip"],
    },
    {
      title: "Braços",
      subtitle: "Identifique o lado e o estado da musculatura",
      keys: [
        "rightRelaxed",
        "rightContracted",
        "leftRelaxed",
        "leftContracted",
      ],
    },
    {
      title: "Membros inferiores",
      subtitle: "Medição bilateral das coxas",
      keys: ["rightThigh", "leftThigh"],
    },
  ];
export function Circumferences({ draft: d, update, onFocus }: Props) {
  return (
    <>
      <SectionTitle
        title="A forma da evolução."
        sub="Registre os perímetros em centímetros. Campos não medidos podem ficar em branco."
      />
      {groups.map((g, i) => (
        <section className="measurement-group" key={g.title}>
          <div className="group-heading">
            <span>0{i + 1}</span>
            <div>
              <h3>{g.title}</h3>
              <p>{g.subtitle}</p>
            </div>
          </div>
          <div className="form-grid">
            {g.keys.map((k) => (
              <NumberField
                key={k}
                label={circumferenceLabels[k]}
                unit="cm"
                value={d.circumferences[k]}
                onFocus={() => onFocus?.(k)}
                onChange={(v) =>
                  update({ circumferences: { ...d.circumferences, [k]: v } })
                }
              />
            ))}
          </div>
        </section>
      ))}
      <div className="symmetry">
        <h3>Diferenças entre os lados</h3>
        <p>Diferença absoluta em cm, sem interpretação clínica.</p>
        <div>
          <span>
            Braço relaxado{" "}
            <strong>
              {fmt(
                difference(
                  d.circumferences.rightRelaxed,
                  d.circumferences.leftRelaxed,
                ),
              )}{" "}
              cm
            </strong>
          </span>
          <span>
            Braço contraído{" "}
            <strong>
              {fmt(
                difference(
                  d.circumferences.rightContracted,
                  d.circumferences.leftContracted,
                ),
              )}{" "}
              cm
            </strong>
          </span>
          <span>
            Coxas{" "}
            <strong>
              {fmt(
                difference(
                  d.circumferences.rightThigh,
                  d.circumferences.leftThigh,
                ),
              )}{" "}
              cm
            </strong>
          </span>
        </div>
      </div>
    </>
  );
}
export function Review({
  draft: d,
  onEdit,
}: {
  draft: Draft;
  onEdit: (step: number) => void;
}) {
  const warning = warnings(d);
  const result = safeResult(d);
  return (
    <>
      <SectionTitle
        title="Tudo pronto para avançar?"
        sub="Revise a coleta antes de transformar medidas em resultados."
      />
      {warning.length > 0 && (
        <div className="notice">
          <AlertCircle size={18} />
          <div>
            <strong>Pontos para conferir</strong>
            {warning.map((w) => (
              <p key={w}>{w}</p>
            ))}
          </div>
        </div>
      )}
      <section className="review-section">
        <SectionTitle
          title="Dados da avaliação"
          action={
            <button
              type="button"
              className="text-link"
              onClick={() => onEdit(0)}
            >
              <Pencil size={14} />
              Editar dados
            </button>
          }
        />
        <dl className="review-grid">
          <div>
            <dt>Data</dt>
            <dd>{dateLabel(d.date)}</dd>
          </div>
          <div>
            <dt>Peso</dt>
            <dd>{fmt(d.weight)} kg</dd>
          </div>
          <div>
            <dt>Altura</dt>
            <dd>{fmt(d.height, 2)} m</dd>
          </div>
          <div>
            <dt>Idade</dt>
            <dd>{d.age} anos</dd>
          </div>
          <div>
            <dt>Sexo</dt>
            <dd>
              {d.sex === "male"
                ? "Masculino"
                : d.sex === "female"
                  ? "Feminino"
                  : "Outro"}
            </dd>
          </div>
          <div>
            <dt>Condicionamento</dt>
            <dd>{d.fitness}</dd>
          </div>
        </dl>
      </section>
      <section className="review-section">
        <SectionTitle
          title="Dobras cutâneas"
          action={
            <button
              type="button"
              className="text-link"
              onClick={() => onEdit(1)}
            >
              <Pencil size={14} />
              Editar dobras
            </button>
          }
        />
        <div className="review-measures">
          {d.skinfolds.map((m) => (
            <div key={m.site}>
              <span>
                {siteLabels[m.site]}
                <small>{m.readings.map((v) => fmt(v)).join(" / ")}</small>
              </span>
              <strong>
                {fmt(average(m))} <small>mm</small>
              </strong>
            </div>
          ))}
        </div>
        <div className="sum-bar">
          <span>Soma das médias</span>
          <strong>
            {fmt(result?.sum)} <small>mm</small>
          </strong>
        </div>
      </section>
      <section className="review-section">
        <SectionTitle
          title="Perimetria"
          action={
            <button
              type="button"
              className="text-link"
              onClick={() => onEdit(2)}
            >
              <Pencil size={14} />
              Editar perimetria
            </button>
          }
        />
        <div className="review-measures">
          {CIRCUMFERENCES.map((k) => (
            <div key={k}>
              <span>{circumferenceLabels[k]}</span>
              <strong>
                {d.circumferences[k] === null ? (
                  <small>Não registrado</small>
                ) : (
                  `${fmt(d.circumferences[k])} cm`
                )}
              </strong>
            </div>
          ))}
        </div>
      </section>
      {d.notes && (
        <section className="review-section">
          <h3>Observações</h3>
          <p className="notes-text">{d.notes}</p>
        </section>
      )}
    </>
  );
}
