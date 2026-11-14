import { Link } from "@tanstack/react-router";
import groupPhoto from "@/assets/community-group.webp";
import { useNido } from "@/lib/nido-store";
import { AFFECTED, BASE_ASSISTED, TOTAL_RAISED_USD, formatMoney, type Lang } from "@/lib/nido-data";
import { COMMUNITY_COUNTS, fmtCount, ideasCopy } from "@/lib/community-copy";
import type { PublicPost } from "@/lib/blog.functions";
import { DonateButton, Kicker, Stat } from "@/components/ideas/shared";

/** How many field-journal posts the "What's new this week" section shows. */
const LATEST_POSTS = 3;

/** Design A ("Comunidad primero"): the donor homepage's community-first top section. */
export function CommunityHome({
  posts,
  onSeeBooks,
}: {
  /** Published field-journal posts, newest first. */
  posts: PublicPost[];
  onSeeBooks: () => void;
}) {
  const { lang, currency, extraAssisted } = useNido();
  const c = ideasCopy[lang];
  const a = c.a;
  const latest = posts.slice(0, LATEST_POSTS);
  const stats = [
    {
      value: fmtCount(COMMUNITY_COUNTS.mingas),
      label: c.mingas,
      hint: COMMUNITY_COUNTS.mingas === null ? c.pending : undefined,
    },
    {
      value: fmtCount(COMMUNITY_COUNTS.ollas),
      label: c.ollas,
      hint: COMMUNITY_COUNTS.ollas === null ? c.pending : undefined,
    },
    { value: `${BASE_ASSISTED + extraAssisted} / ${AFFECTED}`, label: c.families },
    { value: formatMoney(TOTAL_RAISED_USD, currency), label: c.raised },
  ];

  return (
    <div className="space-y-16">
      <section className="flex flex-wrap items-center gap-12 pt-4">
        <div className="flex min-w-[min(100%,20rem)] flex-1 basis-[28rem] flex-col gap-5">
          <Kicker>{a.kicker}</Kicker>
          <h2 className="font-display text-5xl font-medium leading-[1.04] text-primary sm:text-7xl">
            {a.title}
          </h2>
          <p className="max-w-lg text-xl leading-relaxed text-muted-foreground">{a.lead}</p>
          <div className="mt-1.5 flex flex-wrap gap-3">
            <a
              href="#semana"
              className="inline-flex min-h-12 items-center rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground transition hover:brightness-110"
            >
              {a.seeWeek}
            </a>
            <DonateButton lang={lang} outline />
          </div>
        </div>
        <img
          src={groupPhoto}
          alt={a.photoAlt}
          className="h-[26rem] min-w-[min(100%,18rem)] flex-1 basis-[24rem] rounded-3xl object-cover object-[50%_30%]"
        />
      </section>

      <section
        id="semana"
        className="scroll-mt-24 space-y-7 rounded-3xl bg-secondary px-6 py-12 sm:px-10"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-3xl font-medium text-primary sm:text-4xl">
            {a.weekTitle}
          </h2>
          <span className="text-sm text-muted-foreground">{a.weekBy}</span>
        </div>
        {latest.length ? (
          <div className="grid gap-5 md:grid-cols-3">
            {latest.map((p) => (
              <JournalCard key={p.id} post={p} lang={lang} readMore={a.readMore} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed bg-card p-6 text-base text-muted-foreground">
            {a.noPosts}
          </p>
        )}
        <Link
          to="/blog"
          className="inline-block border-b-2 border-accent pb-0.5 text-base font-semibold text-primary"
        >
          {a.allPosts}
        </Link>
      </section>

      <section id="juntos" className="scroll-mt-24 space-y-8">
        <h2 className="font-display text-3xl font-medium text-primary sm:text-4xl">{a.together}</h2>
        <div className="grid grid-cols-2 divide-x border-y lg:grid-cols-4 [&>*:nth-child(n+3)]:border-t lg:[&>*:nth-child(n+3)]:border-t-0">
          {stats.map((s) => (
            <Stat key={s.label} {...s} />
          ))}
        </div>
      </section>

      <section id="cuentas" className="scroll-mt-24 flex flex-wrap items-center gap-10">
        <div className="flex flex-1 basis-[22rem] flex-col gap-3.5">
          <h2 className="font-display text-3xl font-medium text-primary sm:text-4xl">
            {a.accountsTitle}
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">{a.accountsLead}</p>
          <button
            type="button"
            onClick={onSeeBooks}
            className="self-start border-b-2 border-accent pb-0.5 text-base font-semibold text-primary"
          >
            {c.seeAccounts}
          </button>
        </div>
        <ol className="grid flex-1 basis-[26rem] gap-4 sm:grid-cols-3">
          {a.steps.map((t, i) => (
            <li key={t} className="rounded-2xl border bg-card p-5">
              <p className="text-sm font-semibold text-[oklch(0.5_0.14_40)]">
                {a.step} {i + 1}
              </p>
              <p className="mt-1.5 font-display text-xl">{t}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className="rounded-2xl bg-primary px-6 py-5 text-center text-sm text-primary-foreground">
        {c.privacy}
      </p>
    </div>
  );
}

function JournalCard({ post, lang, readMore }: { post: PublicPost; lang: Lang; readMore: string }) {
  const es = lang === "es";
  const title = es ? post.title_es : post.title_en;
  const excerpt = (es ? post.body_es : post.body_en).split(/\n\s*\n/).find(Boolean) ?? "";
  const photo = post.photos[0];
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border bg-card">
      {photo && (
        <img
          src={photo.url}
          alt={es ? photo.caption_es : photo.caption_en}
          loading="lazy"
          className="h-48 w-full object-cover"
        />
      )}
      <div className="flex flex-1 flex-col gap-3 p-6">
        {post.published_at && (
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {new Date(post.published_at).toLocaleDateString(es ? "es-CO" : "en-US", {
              dateStyle: "long",
            })}
          </p>
        )}
        <h3 className="font-display text-2xl font-medium">
          <Link to="/blog/$id" params={{ id: post.id }} className="hover:underline">
            {title}
          </Link>
        </h3>
        <p className="line-clamp-4 text-base text-muted-foreground">{excerpt}</p>
        <Link
          to="/blog/$id"
          params={{ id: post.id }}
          aria-label={`${readMore}: ${title}`}
          className="mt-auto self-start text-sm font-semibold text-primary underline"
        >
          {readMore}
        </Link>
      </div>
    </article>
  );
}
