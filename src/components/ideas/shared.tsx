import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { ideasCopy, statValueSize } from "@/lib/community-copy";
import type { Lang } from "@/lib/nido-data";

export const GOFUNDME =
  "https://www.gofundme.com/f/support-pijao-families-after-earthquake-and-fires?cp_src=d";

/** Warm terracotta that passes contrast on light backgrounds (the --accent token is for fills). */
export const TERRACOTTA = "text-[oklch(0.5_0.14_40)]";

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className={cn("text-sm font-semibold uppercase tracking-[0.12em]", TERRACOTTA)}>
      {children}
    </p>
  );
}

export function DonateButton({ lang, outline = false }: { lang: Lang; outline?: boolean }) {
  const label = ideasCopy[lang].donate;
  return (
    <a
      href={GOFUNDME}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex min-h-12 items-center gap-2 rounded-full px-7 text-base font-semibold transition",
        outline
          ? "border-[1.5px] border-primary text-primary hover:bg-primary/5"
          : "bg-[oklch(0.5_0.14_40)] text-white hover:brightness-110",
      )}
    >
      <Heart className="h-4 w-4" aria-hidden="true" />
      {label}
    </a>
  );
}

/** Marks sample content so nobody mistakes placeholders for real records. */
export function ExampleBadge({ lang }: { lang: Lang }) {
  const c = ideasCopy[lang];
  return (
    <span
      title={c.exampleNote}
      className="inline-flex items-center rounded-full border border-dashed border-muted-foreground/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
    >
      {c.example}
    </span>
  );
}

const ROUTES = ["a", "b", "c", "d"] as const;

export function DirectionSwitcher({
  lang,
  current,
}: {
  lang: Lang;
  current: (typeof ROUTES)[number];
}) {
  const c = ideasCopy[lang];
  return (
    <nav
      aria-label={c.others}
      className="mt-16 flex flex-wrap items-center gap-2 border-t pt-6 print:hidden"
    >
      <span className="mr-2 text-sm text-muted-foreground">{c.others}:</span>
      {ROUTES.map((r) => (
        <Link
          key={r}
          to={`/ideas/${r}` as "/ideas/a"}
          aria-current={r === current ? "page" : undefined}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
            r === current
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-card hover:bg-muted",
          )}
        >
          {c.names[r]}
        </Link>
      ))}
    </nav>
  );
}

export function Stat({
  value,
  label,
  hint,
}: {
  value: string;
  label: string;
  hint?: string | undefined;
}) {
  return (
    <div className="@container min-w-0 px-4 py-7 sm:px-6">
      <p
        className={cn(
          "font-display font-medium leading-none whitespace-nowrap text-primary tabular-nums",
          statValueSize(value),
        )}
      >
        {value}
      </p>
      <p className="mt-2.5 text-base text-muted-foreground">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
