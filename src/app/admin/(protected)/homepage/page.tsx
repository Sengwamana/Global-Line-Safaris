"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Check, Plus, RotateCcw, Trash2 } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SECTIONS = ["hero", "about", "destinations", "services", "packages", "whyChoose", "gallery", "partners", "finalCta"];

export default function AdminHomepagePage() {
  const [activeSection, setActiveSection] = useState("hero");
  const [sections, setSections] = useState<Record<string, any>>({});
  const [savedSections, setSavedSections] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all(SECTIONS.map(s => fetch(`/api/admin/homepage/${s}`).then(r => r.ok ? r.json() : null).catch(() => null)))
      .then(results => {
        const map: Record<string, any> = {};
        SECTIONS.forEach((s, i) => {
          const result = results[i] || { sectionKey: s };
          // Prisma stores homepage cards as JSON text; turn it back into an
          // editable array before rendering the editor.
          if (typeof result.items === "string") {
            try { result.items = JSON.parse(result.items); } catch { result.items = []; }
          }
          map[s] = result;
        });
        setSections(map);
        setSavedSections(structuredClone(map));
        if (results.some((result) => result === null)) {
          setLoadError("Some homepage sections could not be loaded. Refresh the page before editing them.");
        }
        setLoading(false);
      })
      .catch(() => { setLoadError("Homepage content could not be loaded. Please refresh and try again."); setLoading(false); });
  }, []);

  const saveSection = async (key: string) => {
    setSaving(true);
    const data = sections[key] || {};
    try {
      const res = await fetch(`/api/admin/homepage/${key}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) {
        const updated = await res.json();
        if (typeof updated.items === "string") {
          try { updated.items = JSON.parse(updated.items); } catch { updated.items = []; }
        }
        setSections((current) => ({ ...current, [key]: updated }));
        setSavedSections((current) => ({ ...current, [key]: structuredClone(updated) }));
        toast.success(`${key} section updated`);
      } else {
        const error = await res.json().catch(() => ({}));
        toast.error(error.error || "Failed to save section");
      }
    } catch {
      toast.error("Could not save section. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, field: string, value: any) => {
    setSections((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const updateItemField = (key: string, index: number, field: string, value: string) => {
    const current = Array.isArray(section.items) ? [...section.items] : [];
    current[index] = { ...(current[index] || {}), [field]: value };
    updateField(key, "items", current);
  };

  const addItem = (key: string) => {
    const current = Array.isArray(section.items) ? [...section.items] : [];
    current.push({ icon: "", title: "", description: "" });
    updateField(key, "items", current);
  };

  const removeItem = (key: string, index: number) => {
    const current = Array.isArray(section.items) ? [...section.items] : [];
    current.splice(index, 1);
    updateField(key, "items", current);
  };

  const section = sections[activeSection] || {};
  const items = Array.isArray(section.items) ? section.items : [];
  const hasChanges = JSON.stringify(section) !== JSON.stringify(savedSections[activeSection] || {});

  return (
    <AdminPageShell title="Homepage" subtitle="Edit homepage sections and content" loading={loading}>
      {loadError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</div>
      ) : (
      <div className="flex flex-col gap-5 lg:flex-row lg:gap-6">
        <div className="shrink-0 lg:w-52">
          <div className="flex gap-1 overflow-x-auto pb-1 lg:block lg:space-y-0.5">
            {SECTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={`shrink-0 whitespace-nowrap text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors lg:w-full ${
                  activeSection === s
                    ? "bg-brand/10 text-brand"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {s.replace(/([A-Z])/g, " $1").trim()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-700/50 p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div><h2 className="text-lg font-black text-slate-900 dark:text-white capitalize">{activeSection.replace(/([A-Z])/g, " $1").trim()} Section</h2><p className="mt-1 text-xs text-slate-500">Changes stay local until you save this section.</p></div>
            {hasChanges && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">Unsaved changes</span>}
          </div>

          <div><Label>Eyebrow</Label><Input value={section.eyebrow ?? ""} onChange={e => updateField(activeSection, "eyebrow", e.target.value)} className="mt-1" /></div>
          <div><Label>Title</Label><Input value={section.title ?? ""} onChange={e => updateField(activeSection, "title", e.target.value)} className="mt-1" /></div>
          <div><Label>Subtitle</Label><textarea value={section.subtitle ?? ""} onChange={e => updateField(activeSection, "subtitle", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm min-h-[80px]" /></div>
          <div><Label>Description</Label><textarea value={section.description ?? ""} onChange={e => updateField(activeSection, "description", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm min-h-[80px]" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>CTA Label</Label><Input value={section.ctaLabel ?? ""} onChange={e => updateField(activeSection, "ctaLabel", e.target.value)} className="mt-1" /></div>
            <div><Label>CTA URL</Label><Input value={section.ctaUrl ?? ""} onChange={e => updateField(activeSection, "ctaUrl", e.target.value)} className="mt-1" /></div>
          </div>
          <div><Label>Image Key Reference</Label><Input value={section.imageKey ?? ""} onChange={e => updateField(activeSection, "imageKey", e.target.value)} className="mt-1" placeholder="e.g. hero, about, advisory, technology" /></div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <Label>Items (cards / highlights)</Label>
              <Button type="button" variant="outline" size="sm" className="rounded-xl gap-1" onClick={() => addItem(activeSection)}>
                <Plus className="size-3.5" /> Add Item
              </Button>
            </div>
            {items.length === 0 ? (
              <p className="text-xs text-slate-400">No items yet. Add cards with an icon, title, and description.</p>
            ) : (
              <div className="space-y-3">
                {items.map((item: any, idx: number) => (
                  <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-[10px]">Icon</Label><Input value={item.icon ?? ""} onChange={e => updateItemField(activeSection, idx, "icon", e.target.value)} className="mt-1" placeholder="Briefcase" /></div>
                      <div className="flex items-end justify-end">
                        <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => removeItem(activeSection, idx)}><Trash2 className="size-3.5" /></Button>
                      </div>
                    </div>
                    <div><Label className="text-[10px]">Title</Label><Input value={item.title ?? ""} onChange={e => updateItemField(activeSection, idx, "title", e.target.value)} className="mt-1" /></div>
                    <div><Label className="text-[10px]">Description</Label><textarea value={item.description ?? ""} onChange={e => updateItemField(activeSection, idx, "description", e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm min-h-[60px]" /></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            {hasChanges && <Button variant="outline" className="rounded-xl" onClick={() => setSections((current) => ({ ...current, [activeSection]: structuredClone(savedSections[activeSection] || {}) }))}><RotateCcw className="mr-1.5 size-3.5" />Discard changes</Button>}
            <Button variant="brand" className="rounded-xl" onClick={() => saveSection(activeSection)} disabled={saving}>
              <Check className="mr-1.5 size-3.5" />{saving ? "Saving..." : "Save Section"}
            </Button>
          </div>
        </div>
      </div>
      )}
    </AdminPageShell>
  );
}
