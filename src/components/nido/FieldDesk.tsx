import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIES } from "@/lib/donor-impact";
import { normalizePhone } from "@/lib/field-updates";
import type { Database } from "@/integrations/supabase/types";

type Tbl = Database["public"]["Tables"];
type Sender = Tbl["field_senders"]["Row"];
type Update = Tbl["field_updates"]["Row"];
type Post = Tbl["blog_posts"]["Row"] & { blog_post_media: Tbl["blog_post_media"]["Row"][] };

const sb = async () => (await import("@/integrations/supabase/client")).supabase;
const when = (s: string) => new Date(s).toLocaleString();
const sel = "h-9 rounded-md border bg-background px-2 text-sm";

export function FieldDesk({ households }: { households: { id: string }[] }) {
  const [senders, setSenders] = useState<Sender[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const c = await sb();
    const [s, u, p] = await Promise.all([
      c.from("field_senders").select("*").order("name"),
      c.from("field_updates").select("*").order("sent_at", { ascending: false }).limit(200),
      c.from("blog_posts").select("*, blog_post_media(*)").neq("status", "discarded").order("created_at", { ascending: false }).limit(30),
    ]);
    for (const r of [s, u, p]) if (r.error) { toast.error(r.error.message); return; }
    setSenders(s.data ?? []); setUpdates(u.data ?? []); setPosts((p.data ?? []) as Post[]);
    const paths = (u.data ?? []).filter((x) => x.media_path).map((x) => x.media_path!);
    if (paths.length) {
      const signed = await c.storage.from("field-media").createSignedUrls(paths, 3600);
      setUrls(Object.fromEntries((signed.data ?? []).filter((x) => x.signedUrl).map((x) => [x.path, x.signedUrl])));
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const senderName = (id: string | null) => senders.find((s) => s.id === id)?.name ?? "Unknown";
  const updateById = (id: string) => updates.find((u) => u.id === id);

  async function patchUpdate(id: string, patch: Tbl["field_updates"]["Update"]) {
    const { error } = await (await sb()).from("field_updates").update(patch).eq("id", id);
    if (error) toast.error(error.message); else setUpdates((l) => l.map((u) => (u.id === id ? { ...u, ...patch } as Update : u)));
  }

  return (
    <div className="rounded-xl bg-card p-4 shadow-card">
      <h3 className="mb-1 text-xl font-semibold">Field updates & blog</h3>
      <p className="mb-3 text-sm text-muted-foreground">Messages, photos and voice notes from verified WhatsApp numbers. The AI writes a draft post every 2 days; nothing goes public until you publish it.</p>
      <Tabs defaultValue="updates">
        <TabsList>
          <TabsTrigger value="updates">Field updates ({updates.length})</TabsTrigger>
          <TabsTrigger value="blog">Blog ({posts.filter((p) => p.status === "draft").length} drafts)</TabsTrigger>
          <TabsTrigger value="senders">Field senders ({senders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="updates" className="space-y-2">
          {updates.map((u) => (
            <div key={u.id} className={`rounded-lg border p-3 ${u.hidden ? "opacity-50" : ""}`}>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{senderName(u.sender_id)}</span>
                <span>{when(u.sent_at)}</span><span>· {u.kind}</span>
                {u.used_in_post_id && <span className="rounded bg-success/15 px-1.5 text-primary">in a post</span>}
                {u.media_status === "pending" && <span>media downloading…</span>}
                {u.media_status === "failed" && <span className="text-destructive">media failed</span>}
              </div>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                {u.media_path && urls[u.media_path] && (u.kind === "image"
                  ? <img src={urls[u.media_path]} alt="Field photo" className="h-32 w-32 shrink-0 rounded object-cover" />
                  : u.kind === "audio" ? <audio controls src={urls[u.media_path]} className="w-60" />
                  : <a href={urls[u.media_path]} target="_blank" rel="noreferrer" className="text-sm underline">Open file</a>)}
                <div className="flex-1 space-y-2">
                  <Textarea defaultValue={u.text} placeholder="Message / caption" onBlur={(e) => e.target.value !== u.text && patchUpdate(u.id, { text: e.target.value })} />
                  {u.kind === "audio" && <Textarea defaultValue={u.transcript ?? ""} placeholder="Voice note transcript" onBlur={(e) => e.target.value !== (u.transcript ?? "") && patchUpdate(u.id, { transcript: e.target.value })} />}
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <select aria-label="Household" className={sel} value={u.household_id ?? ""} onChange={(e) => patchUpdate(u.id, { household_id: e.target.value || null })}>
                      <option value="">No household</option>{households.map((h) => <option key={h.id} value={h.id}>{h.id}</option>)}
                    </select>
                    <select aria-label="Category" className={sel} value={u.category ?? ""} onChange={(e) => patchUpdate(u.id, { category: (e.target.value || null) as Update["category"] })}>
                      <option value="">No category</option>{Object.keys(CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <label className="flex items-center gap-1"><input type="checkbox" checked={u.exclude_from_blog} onChange={(e) => patchUpdate(u.id, { exclude_from_blog: e.target.checked })} /> Keep out of blog</label>
                    <label className="flex items-center gap-1"><input type="checkbox" checked={u.hidden} onChange={(e) => patchUpdate(u.id, { hidden: e.target.checked })} /> Hide</label>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!updates.length && <p className="py-6 text-center text-sm text-muted-foreground">No WhatsApp updates yet.</p>}
        </TabsContent>

        <TabsContent value="blog" className="space-y-4">
          {posts.map((p) => <PostEditor key={p.id} post={p} urls={urls} updateById={updateById} onChange={load} />)}
          {!posts.length && <p className="py-6 text-center text-sm text-muted-foreground">No posts yet. The first draft appears after updates come in.</p>}
        </TabsContent>

        <TabsContent value="senders"><Senders senders={senders} onChange={load} /></TabsContent>
      </Tabs>
    </div>
  );
}

function PostEditor({ post, urls, updateById, onChange }: { post: Post; urls: Record<string, string>; updateById: (id: string) => Update | undefined; onChange: () => void }) {
  const [f, setF] = useState({ title_es: post.title_es, title_en: post.title_en, body_es: post.body_es, body_en: post.body_en });
  async function save(status?: "published" | "discarded") {
    const c = await sb();
    const { error } = await c.from("blog_posts").update({ ...f, ...(status ? { status, published_at: status === "published" ? new Date().toISOString() : null } : {}) }).eq("id", post.id);
    if (error) { toast.error(error.message); return; }
    toast.success(status === "published" ? "Published" : status === "discarded" ? "Discarded" : "Saved");
    onChange();
  }
  async function removePhoto(updateId: string) {
    const { error } = await (await sb()).from("blog_post_media").delete().eq("post_id", post.id).eq("update_id", updateId);
    if (error) toast.error(error.message); else onChange();
  }
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{post.status} · {when(post.created_at)}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {(["es", "en"] as const).map((l) => (
          <div key={l} className="space-y-2">
            <Input aria-label={`Title ${l}`} value={f[`title_${l}`]} onChange={(e) => setF({ ...f, [`title_${l}`]: e.target.value })} />
            <Textarea aria-label={`Body ${l}`} rows={10} value={f[`body_${l}`]} onChange={(e) => setF({ ...f, [`body_${l}`]: e.target.value })} />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {post.blog_post_media.sort((a, b) => a.position - b.position).map((m) => {
          const path = updateById(m.update_id)?.media_path;
          return (
            <div key={m.update_id} className="w-32 text-xs">
              {path && urls[path] && <img src={urls[path]} alt={m.caption_en} className="h-24 w-32 rounded object-cover" />}
              <p className="line-clamp-2">{m.caption_en}</p>
              <button className="text-destructive underline" onClick={() => removePhoto(m.update_id)}>Remove</button>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => save()}>Save</Button>
        {post.status === "draft" ? <Button onClick={() => save("published")}>Publish</Button> : <Button variant="outline" onClick={() => save()}>Update published post</Button>}
        <Button variant="ghost" onClick={() => save("discarded")}>Discard</Button>
      </div>
    </div>
  );
}

function Senders({ senders, onChange }: { senders: Sender[]; onChange: () => void }) {
  const [f, setF] = useState({ phone: "", name: "", role: "volunteer", vereda: "" });
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const phone = normalizePhone(f.phone);
    if (phone.length < 8) { toast.error("Enter the full number with country code, e.g. +57 300 123 4567"); return; }
    const { error } = await (await sb()).from("field_senders").insert({ phone, name: f.name.trim(), role: f.role, vereda: f.vereda.trim() || null });
    if (error) { toast.error(error.message); return; }
    setF({ phone: "", name: "", role: "volunteer", vereda: "" }); onChange();
  }
  async function toggle(s: Sender) {
    const { error } = await (await sb()).from("field_senders").update({ active: !s.active }).eq("id", s.id);
    if (error) toast.error(error.message); else onChange();
  }
  return (
    <div className="space-y-3">
      <form onSubmit={add} className="flex flex-wrap gap-2">
        <Input className="w-48" placeholder="+57 300 123 4567" aria-label="WhatsApp number" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        <Input className="w-40" placeholder="Name" aria-label="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <select aria-label="Role" className={sel} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
          <option value="volunteer">Volunteer</option><option value="coordinator">Coordinator</option><option value="crew lead">Crew lead</option><option value="community leader">Community leader</option>
        </select>
        <Input className="w-36" placeholder="Vereda" aria-label="Vereda" value={f.vereda} onChange={(e) => setF({ ...f, vereda: e.target.value })} />
        <Button type="submit" disabled={!f.phone || !f.name.trim()}>Add number</Button>
      </form>
      {senders.map((s) => (
        <div key={s.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
          <span><b>{s.name}</b> · +{s.phone} · {s.role}{s.vereda ? ` · ${s.vereda}` : ""}</span>
          <Button size="sm" variant={s.active ? "outline" : "secondary"} onClick={() => toggle(s)}>{s.active ? "Deactivate" : "Reactivate"}</Button>
        </div>
      ))}
      {!senders.length && <p className="text-sm text-muted-foreground">No verified numbers yet. Messages from unlisted numbers are ignored.</p>}
    </div>
  );
}
