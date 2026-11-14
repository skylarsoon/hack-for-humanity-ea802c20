import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { useNido } from "@/lib/nido-store";
import { PHASES } from "@/lib/nido-data";
import { VEREDAS, ideasCopy } from "@/lib/community-copy";
import { cn } from "@/lib/utils";
import { DirectionSwitcher, DonateButton, ExampleBadge } from "@/components/ideas/shared";

export const Route = createFileRoute("/ideas/c")({
  head: () => ({
    meta: [
      { title: "C · Tablero de vereda · Nido Abierto" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DirectionC,
});

// Illustrative only: not tied to real progress data.
const BAR_WIDTHS = ["70%", "40%", "15%"];

function DirectionC() {
  const { lang } = useNido();
  const c = ideasCopy[lang];
  const k = c.c;
  const [vereda, setVereda] = useState<string>("all");
  const tabs = [{ id: "all", name: k.all }, ...VEREDAS.map((v) => ({ id: v, name: v }))];

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <h2 className="font-display text-4xl font-medium leading-[1.08] text-primary sm:text-5xl">
            {k.title}
          </h2>
          <p className="text-lg text-muted-foreground">{k.lead}</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-primary px-5 text-[15px] font-semibold text-primary transition hover:bg-primary/5 print:hidden"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          {k.print}
        </button>
      </div>

      <div role="tablist" aria-label="Veredas" className="flex flex-wrap gap-2.5 print:hidden">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={vereda === t.id}
            onClick={() => setVereda(t.id)}
            className={cn(
              "min-h-11 rounded-full px-5 text-base font-semibold transition-colors",
              vereda === t.id
                ? "bg-primary text-primary-foreground"
                : "border bg-card hover:bg-muted",
            )}
          >
            {t.name}
          </button>
        ))}
      </div>
      <p className="hidden text-lg font-semibold print:block">
        {vereda === "all" ? k.all : vereda}
      </p>

      <div className="flex flex-wrap items-start gap-6">
        <section className="flex flex-1 basis-[20rem] flex-col gap-4 rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-2xl font-medium text-primary">{k.upcoming}</h3>
            <ExampleBadge lang={lang} />
          </div>
          {k.up.map((u) => (
            <div key={u.title} className="flex gap-3.5 border-t pt-3.5">
              <div className="min-w-16 rounded-xl bg-secondary px-1.5 py-2 text-center">
                <p className="text-xs font-semibold text-[oklch(0.5_0.14_40)]">{u.day}</p>
                <p className="mt-0.5 font-display text-2xl">{u.num}</p>
              </div>
              <div>
                <p className="text-[17px] font-semibold">{u.title}</p>
                <p className="mt-1 text-[15px] text-muted-foreground">
                  {vereda === "all" ? "[Vereda]" : vereda} · {u.meta}
                </p>
              </div>
            </div>
          ))}
        </section>

        <section className="flex flex-[1.4_1_26rem] flex-col gap-5 rounded-2xl border bg-card p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-2xl font-medium text-primary">{k.progress}</h3>
            <span className="text-xs text-muted-foreground">{k.illustrative}</span>
          </div>
          {([1, 2, 3] as const).map((p, i) => (
            <div key={p} className="flex flex-col gap-2">
              <div className="flex justify-between gap-3 text-base">
                <span className="font-semibold">{PHASES[p][lang]}</span>
                <span className="text-muted-foreground">{k.phaseLabels[i]}</span>
              </div>
              <div
                role="img"
                aria-label={k.illustrative}
                className="h-3.5 overflow-hidden rounded-full bg-muted"
              >
                <div className="h-full rounded-full bg-primary" style={{ width: BAR_WIDTHS[i] }} />
              </div>
              <p className="text-sm text-muted-foreground">{k.phaseNotes[i]}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-1 basis-[20rem] flex-col gap-5">
          <div className="flex flex-col gap-3 rounded-2xl border bg-card p-6">
            <h3 className="font-display text-2xl font-medium text-primary">{k.need}</h3>
            <ul className="flex flex-col gap-2.5 text-base">
              {k.needs.map(([item, qty]) => (
                <li key={item} className="flex justify-between gap-3 border-t pt-2.5">
                  <span>{item}</span>
                  <span className="text-muted-foreground">{qty}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl bg-primary p-6 text-primary-foreground print:hidden">
            <h3 className="font-display text-2xl font-medium">{k.help}</h3>
            <span className="rounded-xl bg-background px-4 py-3.5 text-base font-semibold text-primary">
              {k.offer}
            </span>
            <span className="rounded-xl bg-background px-4 py-3.5 text-base font-semibold text-primary">
              {k.bring}
            </span>
            <DonateButton lang={lang} />
            <p className="mt-1 text-sm leading-normal opacity-85">{c.noPhone}</p>
          </div>
        </section>
      </div>

      <p className="text-xs text-muted-foreground">{c.exampleNote}</p>
      <DirectionSwitcher lang={lang} current="c" />
    </div>
  );
}
