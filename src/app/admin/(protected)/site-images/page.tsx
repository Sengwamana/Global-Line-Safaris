"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminFetch } from "@/lib/admin-fetch";

const SLOTS = [
  ["hero.1", "Homepage hero — slide 1"], ["hero.2", "Homepage hero — slide 2"], ["hero.3", "Homepage hero — slide 3"],
  ["about", "About page image"], ["advisory", "Contact / Why choose us hero"], ["servicesHero", "Services hero"], ["contact", "Gallery / contact visual"],
] as const;

export default function SiteImagesPage() {
  const [images, setImages] = useState<Record<string, { url: string; alt: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const load = async () => { setLoading(true); try { const res = await adminFetch("/api/admin/site-images"); const json = await res.json(); setImages(Object.fromEntries((json.data || []).map((item: any) => [item.key, { url: item.url, alt: item.alt || "" }]))); } catch { toast.error("Could not load site images"); } finally { setLoading(false); } };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);
  const update = (key: string, field: "url" | "alt", value: string) => setImages((items) => ({ ...items, [key]: { ...(items[key] ?? { url: "", alt: "" }), [field]: value } }));
  const save = async (key: string) => { const image = images[key]; if (!image?.url) { toast.error("Choose an image before saving"); return; } setSaving(key); try { const res = await adminFetch("/api/admin/site-images", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, ...image }) }); if (res.ok) toast.success("Image updated"); else toast.error((await res.json()).error || "Failed to save image"); } catch { toast.error("Failed to save image"); } finally { setSaving(null); } };
  return <AdminPageShell title="Site Images" subtitle="Manage the core visuals used in homepage and page hero sections" loading={loading} onRefresh={load}>
    <div className="grid gap-5 md:grid-cols-2">{SLOTS.map(([key, label]) => { const image = images[key] || { url: "", alt: "" }; return <section key={key} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><h2 className="font-bold text-slate-900 dark:text-white">{label}</h2><p className="mb-4 text-xs text-slate-500">CMS key: {key}</p><ImageUpload label="Image" value={image.url} onChange={(url) => update(key, "url", url)} /><div className="mt-3"><Label className="text-xs">Alternative text</Label><Input className="mt-1 rounded-xl" value={image.alt} onChange={(e) => update(key, "alt", e.target.value)} placeholder="Describe this image" /></div><Button variant="brand" size="sm" className="mt-4 rounded-xl" onClick={() => save(key)} disabled={saving === key}><Save className="mr-1.5 size-3.5" />{saving === key ? "Saving..." : "Save image"}</Button></section>; })}</div>
  </AdminPageShell>;
}
