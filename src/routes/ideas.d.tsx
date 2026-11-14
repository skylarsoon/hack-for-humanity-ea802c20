import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useNido } from "@/lib/nido-store";
import { ideasCopy } from "@/lib/community-copy";
import { cn } from "@/lib/utils";
import { DirectionSwitcher, ExampleBadge, Kicker } from "@/components/ideas/shared";

export const Route = createFileRoute("/ideas/d")({
  head: () => ({
    meta: [
      { title: "D · Mapa y novedades · Nido Abierto" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DirectionD,
});

type Kind = "roofs" | "mingas" | "ollas";
// Illustrative markers per region. Never exact household locations.
const MARKERS: { x: number; y: number; kind: Kind }[] = [
  { x: 150, y: 130, kind: "roofs" },
  { x: 190, y: 160, kind: "roofs" },
  { x: 330, y: 100, kind: "mingas" },
  { x: 520, y: 130, kind: "roofs" },
  { x: 540, y: 190, kind: "ollas" },
  { x: 140, y: 280, kind: "mingas" },
  { x: 340, y: 280, kind: "roofs" },
  { x: 400, y: 300, kind: "ollas" },
];
const FILL: Record<Kind, string> = {
  roofs: "var(--primary)",
  mingas: "oklch(0.5 0.14 40)",
  ollas: "oklch(0.72 0.15 85)",
};

function DirectionD() {
  const { lang } = useNido();
  const c = ideasCopy[lang];
  const d = c.d;
  const [filter, setFilter] = useState<"all" | Kind>("all");
  const chips: { id: "all" | Kind; name: string }[] = [
    { id: "all", name: d.chips.all },
    { id: "roofs", name: d.chips.roofs },
    { id: "mingas", name: d.chips.mingas },
    { id: "ollas", name: d.chips.ollas },
  ];
  const labels = ["Resguardo Ibanacuara", "Vereda La Maizena", "Los Juanes"];

  return (
    <div className="space-y-8">
      <div className="flex max-w-3xl flex-col gap-3.5">
        <Kicker>{d.kicker}</Kicker>
        <h2 className="font-display text-4xl font-medium leading-[1.05] text-primary sm:text-6xl">
          {d.title}
        </h2>
        <p className="text-[19px] leading-relaxed text-muted-foreground">{d.lead}</p>
      </div>

      <div className="flex flex-wrap items-start gap-7">
        <section
          id="mapa"
          aria-label={d.mapLabel}
          className="flex flex-[1.3_1_32rem] scroll-mt-24 flex-col gap-4 rounded-3xl bg-secondary p-6"
        >
          <div role="group" aria-label="Filtro" className="flex flex-wrap gap-2.5">
            {chips.map((ch) => (
              <button
                key={ch.id}
                type="button"
                aria-pressed={filter === ch.id}
                onClick={() => setFilter(ch.id)}
                className={cn(
                  "min-h-10 rounded-full px-[18px] text-[15px] font-semibold transition-colors",
                  filter === ch.id
                    ? "bg-primary text-primary-foreground"
                    : "border bg-card hover:bg-muted",
                )}
              >
                {ch.name}
              </button>
            ))}
          </div>

          <svg
            viewBox="0 0 640 440"
            role="img"
            aria-label={d.mapLabel}
            className="h-auto w-full rounded-2xl border bg-background"
          >
            <path
              d="M60 90 L230 50 L300 140 L210 220 L70 190 Z"
              fill="oklch(0.93 0.04 145)"
              stroke="var(--primary)"
              strokeWidth="1.5"
            />
            <path
              d="M300 140 L230 50 L430 40 L470 150 L380 210 Z"
              fill="var(--secondary)"
              stroke="var(--primary)"
              strokeWidth="1.5"
            />
            <path
              d="M470 150 L430 40 L590 90 L580 230 L500 240 Z"
              fill="oklch(0.93 0.04 145)"
              stroke="var(--primary)"
              strokeWidth="1.5"
            />
            <path
              d="M70 190 L210 220 L240 340 L110 380 L50 290 Z"
              fill="var(--secondary)"
              stroke="var(--primary)"
              strokeWidth="1.5"
            />
            <path
              d="M210 220 L380 210 L500 240 L460 370 L240 340 Z"
              fill="oklch(0.93 0.04 145)"
              stroke="var(--primary)"
              strokeWidth="1.5"
            />
            {MARKERS.filter((m) => filter === "all" || m.kind === filter).map((m) => (
              <circle key={`${m.x}-${m.y}`} cx={m.x} cy={m.y} r="7" fill={FILL[m.kind]} />
            ))}
            {[
              [100, 110, labels[0]],
              [310, 170, labels[1]],
              [480, 105, labels[2]],
              [90, 320, "[Vereda]"],
              [300, 340, "[Vereda]"],
            ].map(([x, y, t], i) => (
              <text
                key={i}
                x={x}
                y={y}
                fontSize="14"
                fill="var(--foreground)"
                fontFamily="Figtree, sans-serif"
              >
                {t}
              </text>
            ))}
          </svg>

          <div className="flex flex-wrap gap-5 text-[15px]">
            {(["roofs", "mingas", "ollas"] as const).map((kind) => (
              <span key={kind} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block h-3.5 w-3.5 rounded-full"
                  style={{ background: FILL[kind] }}
                />
                {d.chips[kind]}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{d.mapNote}</p>
        </section>

        <section
          id="novedades"
          className="flex flex-1 basis-[22rem] scroll-mt-24 flex-col gap-[18px]"
        >
          <div className="flex items-center gap-3">
            <h3 className="font-display text-3xl font-medium text-primary">{d.updates}</h3>
            <ExampleBadge lang={lang} />
          </div>
          {d.items.map((u, i) => (
            <article key={i} className="flex flex-col gap-2 rounded-2xl border bg-card p-5">
              <p className="text-[13px] text-muted-foreground">{u.meta}</p>
              <h4 className="font-display text-[22px] font-medium">{u.title}</h4>
              <p className="text-base leading-normal text-muted-foreground">{u.text}</p>
              <p className="mt-1 text-sm font-semibold text-primary">{d.verified}</p>
            </article>
          ))}
          <p className="text-[13px] leading-normal text-muted-foreground">{d.aiNote}</p>
        </section>
      </div>

      <DirectionSwitcher lang={lang} current="d" />
    </div>
  );
}
