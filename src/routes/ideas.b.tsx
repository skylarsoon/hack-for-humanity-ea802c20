import { createFileRoute } from "@tanstack/react-router";
import { useNido } from "@/lib/nido-store";
import { AFFECTED, BASE_ASSISTED, TOTAL_RAISED_USD, formatMoney } from "@/lib/nido-data";
import { COMMUNITY_COUNTS, fmtCount, ideasCopy, statValueSize } from "@/lib/community-copy";
import { DirectionSwitcher, ExampleBadge, Kicker } from "@/components/ideas/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ideas/b")({
  head: () => ({
    meta: [{ title: "B · Informe abierto · Nido Abierto" }, { name: "robots", content: "noindex" }],
  }),
  component: DirectionB,
});

function DirectionB() {
  const { lang, currency, expenses, households, extraAssisted } = useNido();
  const c = ideasCopy[lang];
  const b = c.b;
  const figures = [
    { value: formatMoney(TOTAL_RAISED_USD, currency), label: c.raised },
    { value: `${BASE_ASSISTED + extraAssisted} / ${AFFECTED}`, label: c.families },
    { value: String(expenses.length), label: c.receipts },
  ];
  const ids = ["resumen", "cuentas", "comunidad", "verificacion"];
  // Real receipts from the ledger; amounts follow the donor's chosen currency.
  // Veredas only (never household names): derived from the households each expense served.
  const veredaOf = (ids: string[]) =>
    Array.from(
      new Set(ids.map((id) => households.find((h) => h.id === id)?.vereda).filter(Boolean)),
    ).join(", ") || "—";
  const rows = [...expenses].sort((x, y) => y.date.localeCompare(x.date)).slice(0, 6);

  return (
    <div className="mx-auto max-w-4xl">
      <nav
        aria-label="Informe"
        className="flex flex-wrap gap-6 border-b pb-4 text-[15px] font-medium"
      >
        {b.nav.map((n, i) => (
          <a key={n} href={`#${ids[i]}`} className="hover:text-[oklch(0.5_0.14_40)]">
            {n}
          </a>
        ))}
      </nav>

      <section id="resumen" className="scroll-mt-24 flex flex-col gap-5 pb-12 pt-16">
        <Kicker>{b.kicker}</Kicker>
        <h2 className="font-display text-5xl font-medium leading-[1.05] text-primary sm:text-6xl">
          {b.title}
        </h2>
        <p className="max-w-2xl text-xl leading-relaxed text-muted-foreground">{b.lead}</p>
      </section>

      <section className="grid border-y-2 border-t-primary border-b-border sm:grid-cols-3">
        {figures.map((f) => (
          <div key={f.label} className="@container min-w-0 py-7 pr-6">
            <p
              className={cn(
                "font-display font-medium leading-none whitespace-nowrap text-primary tabular-nums",
                statValueSize(f.value),
              )}
            >
              {f.value}
            </p>
            <p className="mt-2.5 text-base text-muted-foreground">{f.label}</p>
          </div>
        ))}
      </section>

      <section id="cuentas" className="scroll-mt-24 flex flex-col gap-5 pb-6 pt-16">
        <h2 className="font-display text-3xl font-medium text-primary sm:text-4xl">{b.s1}</h2>
        <p className="max-w-xl text-[17px] leading-relaxed text-muted-foreground">{b.s1Lead}</p>
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[40rem] border-collapse text-base">
            <thead>
              <tr className="bg-secondary text-left">
                {b.cols.map((h, i) => (
                  <th
                    key={h}
                    scope="col"
                    className={`px-4 py-3.5 font-semibold ${i === 3 ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-4 text-muted-foreground">{r.date}</td>
                  <td className="px-4 py-4">{r.description}</td>
                  <td className="px-4 py-4 text-muted-foreground">{veredaOf(r.householdIds)}</td>
                  <td className="px-4 py-4 text-right tabular-nums">
                    {formatMoney(r.usd, currency)}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-success/15 px-2.5 py-1 text-sm font-semibold text-primary">
                      {b.verified}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-5 pb-6 pt-14">
        <h2 className="font-display text-3xl font-medium text-primary sm:text-4xl">{b.s2}</h2>
        <ol className="grid border-t sm:grid-cols-2 lg:grid-cols-4">
          {b.flow.map(([t, d], i) => (
            <li key={t} className="pr-5 pt-5">
              <p className="text-sm font-semibold text-[oklch(0.5_0.14_40)]">
                {c.a.step} {i + 1}
              </p>
              <p className="mb-1 mt-1.5 font-display text-xl">{t}</p>
              <p className="text-[15px] leading-normal text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="comunidad" className="scroll-mt-24 flex flex-col gap-5 pb-6 pt-14">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-3xl font-medium text-primary sm:text-4xl">{b.s3}</h2>
          {(COMMUNITY_COUNTS.mingas === null || COMMUNITY_COUNTS.ollas === null) && (
            <ExampleBadge lang={lang} />
          )}
        </div>
        <div className="flex flex-wrap gap-8">
          {[
            { n: COMMUNITY_COUNTS.mingas, label: b.mingaCard },
            { n: COMMUNITY_COUNTS.ollas, label: b.ollaCard },
          ].map((x) => (
            <div
              key={x.label}
              className="flex flex-1 basis-[22rem] flex-col gap-2.5 rounded-2xl bg-secondary p-7"
            >
              <p className="font-display text-5xl leading-none text-primary">{fmtCount(x.n)}</p>
              <p className="text-[17px]">{x.label}</p>
              {x.n === null && <p className="text-xs text-muted-foreground">{c.pending}</p>}
            </div>
          ))}
        </div>
        <p className="max-w-xl text-[17px] leading-relaxed text-muted-foreground">{b.noPrice}</p>
      </section>

      <section
        id="verificacion"
        className="my-10 scroll-mt-24 flex flex-col gap-2 rounded-2xl border bg-card p-7"
      >
        <h2 className="font-display text-2xl font-medium text-primary">{b.careTitle}</h2>
        <p className="text-base leading-relaxed text-muted-foreground">{b.care}</p>
      </section>

      <DirectionSwitcher lang={lang} current="b" />
    </div>
  );
}
