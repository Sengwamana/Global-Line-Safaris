import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseStringList, parseObjectList } from "@/components/admin/ListField";

const root = path.resolve(import.meta.dirname, "..");

function read(relative: string): string {
  return readFileSync(path.join(root, relative), "utf8");
}

// Paths relative to the repo root (e.g. prisma/, deploy/).
function readRepo(relative: string): string {
  return readFileSync(path.resolve(root, "..", relative), "utf8");
}

describe("CMS regression: admin API route wiring", () => {
  it("trip-inquiries collection route exports POST (create was 405)", () => {
    const src = read("app/api/admin/trip-inquiries/route.ts");
    expect(src).toMatch(/export const POST = createCreateHandler\(/);
    expect(src).toMatch(/export const GET = createListHandler\(/);
  });

  it("every admin page fetches an endpoint that exists", () => {
    // Guards the class of bug where a list page requests a path with no route
    // file behind it (e.g. /api/admin/team vs /api/admin/team-members).
    const pages = [
      "team",
      "trip-inquiries",
      "destinations",
      "tour-packages",
      "services",
      "industries",
      "faqs",
      "blog-posts",
      "media",
      "subscribers",
      "notifications",
      "audit-logs",
      "users",
      "settings",
      "profile",
    ] as const;

    for (const page of pages) {
      const src = read(`app/admin/(protected)/${page}/page.tsx`);
      const endpoints = [
        ...[...src.matchAll(/endpoint:\s*"(\/api\/admin\/[a-z0-9\-/]*)"/g)].map((m) => m[1]),
        ...[...src.matchAll(/["'`]\/api\/admin\/[a-z0-9\-]+/g)].map((m) => m[0].slice(1)),
      ];
      expect(new Set(endpoints).size, `${page} declares no endpoint`).toBeGreaterThan(0);

      for (const endpoint of new Set(endpoints)) {
        const [resource] = endpoint.replace("/api/admin/", "").split("/");
        if (!resource) continue;
        const routeFile = `app/api/admin/${resource}/route.ts`;
        expect(
          () => read(routeFile),
          `${page} fetches ${endpoint} but ${routeFile} does not exist`
        ).not.toThrow();
      }
    }
  });

  it("team page reads the team-members endpoint", () => {
    expect(read("app/admin/(protected)/team/page.tsx")).toContain(
      'endpoint: "/api/admin/team-members"'
    );
  });
});

describe("CMS regression: content editors expose every schema field", () => {
  const cases: Array<[string, string[]]> = [
    [
      "tour-packages",
      ["facts", "highlights", "itinerary", "inclusions", "exclusions", "note", "galleryImages", "priceNote"],
    ],
    ["destinations", ["galleryImages"]],
    ["trip-inquiries", ["travelDate", "duration", "travelers", "budget", "message", "read", "archived"]],
  ];

  for (const [page, fields] of cases) {
    it(`${page} editor manages ${fields.join(", ")}`, () => {
      const src = read(`app/admin/(protected)/${page}/page.tsx`);
      for (const field of fields) {
        expect(src, `${page} is missing the "${field}" field`).toContain(`name: "${field}"`);
      }
    });
  }

  it("every content editor offers the ARCHIVED status", () => {
    const pages = [
      "destinations",
      "tour-packages",
      "services",
      "team",
      "industries",
      "faqs",
      "blog-posts",
    ] as const;

    for (const page of pages) {
      expect(read(`app/admin/(protected)/${page}/page.tsx`), `${page} cannot archive`).toContain(
        'value: "ARCHIVED"'
      );
    }
  });
});

describe("CMS regression: list field parsing", () => {
  it("parses JSON array columns", () => {
    expect(parseStringList('["gorilla trekking","lake kivu"]')).toEqual([
      "gorilla trekking",
      "lake kivu",
    ]);
  });

  it("returns an empty list for null/blank columns", () => {
    expect(parseStringList(null)).toEqual([]);
    expect(parseStringList("")).toEqual([]);
    expect(parseStringList(undefined)).toEqual([]);
  });

  it("falls back to delimiter splitting for legacy plain-text columns", () => {
    expect(parseStringList("Gorilla safaris, Cultural tours\nLake escapes")).toEqual([
      "Gorilla safaris",
      "Cultural tours",
      "Lake escapes",
    ]);
  });

  it("survives malformed JSON by falling back to text, never throwing", () => {
    // A broken column must not crash the editor dialog.
    expect(() => parseStringList("[{not json")).not.toThrow();
    expect(parseStringList('["unterminated')).toEqual(['["unterminated']);
  });

  it("parses itinerary objects and fills missing keys", () => {
    const rows = parseObjectList('[{"heading":"Day 1","body":"Arrive"}]', ["heading", "body"]);
    expect(rows).toEqual([{ heading: "Day 1", body: "Arrive" }]);
    expect(parseObjectList('[{"heading":"Day 1"}]', ["heading", "body"])).toEqual([
      { heading: "Day 1", body: "" },
    ]);
  });

  it("ignores non-object entries in an object list", () => {
    expect(parseObjectList('["nope", 5, {"heading":"Day 1"}]', ["heading"])).toEqual([
      { heading: "Day 1" },
    ]);
  });
});

describe("CMS regression: SEO settings actually reach the public pages", () => {
  // Pages routed through buildPageMetadata() get the full CMS treatment
  // (title, description, ogImage, canonical, indexable).
  const seoPages = [
    "page.tsx",
    "about/page.tsx",
    "contact/page.tsx",
    "services/page.tsx",
    "industries/page.tsx",
    "why-choose-us/page.tsx",
    "training/page.tsx",
    "plan-your-trip/page.tsx",
    "tour-packages/page.tsx",
    "destinations/page.tsx",
    "gallery/page.tsx",
    "mission-and-values/page.tsx",
    "blog/page.tsx",
    "terms/page.tsx",
    "privacy-policy/page.tsx",
    "unsubscribe/page.tsx",
  ];

  it("all SEO-managed pages build metadata through the CMS helper", () => {
    for (const page of seoPages) {
      const src = read(`app/${page}`);
      expect(
        src,
        `${page} does not read SEO settings from the CMS`
      ).toMatch(/buildPageMetadata\(/);
      // A hardcoded metadata export means the CMS editor writes but nothing applies.
      expect(
        src,
        `${page} still hardcodes metadata instead of reading the CMS`
      ).not.toMatch(/export const metadata/);
    }
  });

  it("per-member team pages read the shared team SEO record", () => {
    const src = read("app/about/team/[slug]/page.tsx");
    expect(src).toContain('getSeoSetting("team")');
    expect(src).toContain("robots");
  });

  it("every page listed in the SEO editor has a route", () => {
    const src = read("app/admin/(protected)/seo/page.tsx");
    const keys = [...src.matchAll(/key:\s*"([^"]+)",\s*label:/g)].map((m) => m[1]);
    expect(keys.length).toBeGreaterThan(10);

    const routeFor: Record<string, string> = {
      home: "app/page.tsx",
      "why-choose-us": "app/why-choose-us/page.tsx",
      "mission-and-values": "app/mission-and-values/page.tsx",
      "plan-your-trip": "app/plan-your-trip/page.tsx",
      "tour-packages": "app/tour-packages/page.tsx",
      "privacy-policy": "app/privacy-policy/page.tsx",
      team: "app/about/team/[slug]/page.tsx",
    };

    for (const key of keys) {
      const file = routeFor[key] ?? `app/${key}/page.tsx`;
      expect(() => read(file), `SEO key "${key}" has no page at ${file}`).not.toThrow();
    }
  });

  it("revalidateSite invalidates the SEO cache tag and new routes", () => {
    const src = read("lib/revalidate.ts");
    expect(src).toContain('"seo"');
    for (const route of ["/training", "/terms", "/privacy-policy", "/unsubscribe"]) {
      expect(src).toContain(`"${route}"`);
    }
  });

  it("public content queries no longer hide CMS-published records behind hardcoded allowlists", () => {
    const src = read("lib/content/service.server.ts");
    expect(src).not.toMatch(/PUBLIC_SERVICE_CATEGORY_SLUGS/);
    expect(src).not.toMatch(/PUBLIC_TEAM_IDS/);
    expect(src).not.toMatch(/PUBLIC_AUDIENCE_SLUGS/);
  });

  it("getServiceCategory respects draft/archived status", () => {
    const src = read("lib/content/service.server.ts");
    expect(src).toMatch(/if \(!dbCat \|\| dbCat\.status !== "PUBLISHED"\) return null;/);
  });
});

describe("CMS regression: navigation and RBAC surface", () => {
  it("sidebar exposes Subscribers, which previously had no inbound link", () => {
    expect(read("components/layout/AdminSidebar.tsx")).toContain(
      'href: "/admin/subscribers"'
    );
  });

  it("sidebar hides admin-only sections from editors", () => {
    const src = read("components/layout/AdminSidebar.tsx");
    expect(src).toContain('minRole: "ADMIN"');
    expect(src).toContain("atLeast(item.minRole)");
  });

  it("hard delete stays SUPER_ADMIN-only while archiving is offered to admins", () => {
    const src = read("components/admin/useContentActions.ts");
    expect(src).toContain('atLeast("SUPER_ADMIN")');
    expect(src).toContain('status: archived ? "DRAFT" : "ARCHIVED"');
  });

it("users page hides controls a non-super-admin cannot use", () => {
    const src = read("app/admin/(protected)/users/page.tsx");
    expect(src).toContain('atLeast("SUPER_ADMIN")');
    // The actions column must fall back to a read-only label for lower roles,
    // and the create button must not be rendered at all.
    expect(src).toContain("canManage ?");
    expect(src).toContain("onAdd={canManage ?");
    expect(src).not.toContain("SUPER_ADMIN only");
  });
});

describe("CMS regression: API list filtering", () => {
  it("content list routes filter by status and hide archived by default", () => {
    const routes = [
      "destinations",
      "tour-packages",
      "services",
      "team-members",
      "industries",
      "faqs",
      "blog-posts",
    ];
    for (const route of routes) {
      const src = read(`app/api/admin/${route}/route.ts`);
      expect(src, `${route} cannot filter by status`).toContain('filterParams: ["status"]');
      expect(src, `${route} shows archived by default`).toContain("hideArchivedByDefault: true");
    }
  });

  it("trip inquiries support status/read/archived filters", () => {
    const src = read("app/api/admin/trip-inquiries/route.ts");
    expect(src).toContain('filterParams: ["status", "read", "archived"]');
    expect(src).toContain('filterDefaults: { archived: "false" }');
  });

  it("trip inquiries render the real status instead of a hardcoded NEW badge", () => {
    const src = read("app/admin/(protected)/trip-inquiries/page.tsx");
    expect(src).toContain("STATUS_COLORS[item.status]");
    expect(src).not.toMatch(/text-\[10px\]">NEW</);
  });
});

describe("CMS regression: homepage sections", () => {
  it("partners section is editable in the CMS", () => {
    const src = read("app/admin/(protected)/homepage/page.tsx");
    const match = src.match(/const SECTIONS = \[([^\]]*)\]/);
    expect(match).not.toBeNull();
    const sections = match![1].split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
    for (const key of ["hero", "partners", "gallery", "finalCta"]) {
      expect(sections, `homepage section "${key}" is not editable`).toContain(key);
    }
  });
});
describe("CMS regression: archive field selection", () => {
  // Regression: TripInquiry.status is a lead-lifecycle enum with no ARCHIVED
  // member, so archiving via `status` produced a 400 from the update schema.
  // The shared hook must be told to use the `archived` boolean for that model.
  it("useContentActions supports a boolean archived column", () => {
    const src = read("components/admin/useContentActions.ts");
    expect(src).toContain('export type ArchiveField = "status" | "archived"');
    expect(src).toContain("archiveField === \"status\"");
    expect(src).toContain('{ archived: !archived }');
  });

  it("default archive behaviour still targets the status enum", () => {
    const src = read("components/admin/useContentActions.ts");
    expect(src).toMatch(/archiveField = options\.archiveField \?\? "status"/);
    expect(src).toContain('{ status: archived ? "DRAFT" : "ARCHIVED" }');
  });

  it("trip inquiries wire the boolean archive field", () => {
    const src = read("app/admin/(protected)/trip-inquiries/page.tsx");
    expect(src).toContain('archiveField: "archived"');
    // The generic hook owns archiving; a second local button would duplicate it.
    expect(src.match(/toggleArchive\(item\)/g) ?? []).toHaveLength(1);
  });

  it("trip inquiry status enum has no ARCHIVED member, so archiving must not use it", async () => {
    const { tripInquiryUpdateSchema } = await import("@/lib/validation");
    const parsed = tripInquiryUpdateSchema.safeParse({ status: "ARCHIVED" });
    expect(parsed.success, "status enum unexpectedly accepts ARCHIVED").toBe(false);
    expect(tripInquiryUpdateSchema.safeParse({ archived: true }).success).toBe(true);
  });

  it("content models that do support ARCHIVED keep accepting it", async () => {
    const { serviceUpdateSchema, destinationUpdateSchema } = await import("@/lib/validation");
    expect(serviceUpdateSchema.safeParse({ status: "ARCHIVED" }).success).toBe(true);
    expect(destinationUpdateSchema.safeParse({ status: "ARCHIVED" }).success).toBe(true);
  });

  it("trip-inquiry PATCH handler accepts the archived boolean", () => {
    const src = read("app/api/admin/trip-inquiries/[id]/route.ts");
    expect(src).toContain("tripInquiryUpdateSchema");
  });
});

describe("CMS regression: orphaned models are audited, not silently dropped", () => {
  it("dropped template models stay gone from the schema", () => {
    const schema = readRepo("prisma/schema.prisma");
    for (const model of [
      "Membership",
      "MembershipPlan",
      "SoftwareTool",
      "Testimonial",
      "QuoteRequest",
      "ConsultationRequest",
    ]) {
      expect(schema, `model ${model} should have been dropped`).not.toContain(`model ${model} {`);
    }
    expect(schema).not.toContain("enum QuoteStatus");
    expect(schema).not.toContain("enum ConsultationStatus");
  });

  it("every remaining Prisma model is referenced by code or seed", () => {
    const models = [...readRepo("prisma/schema.prisma").matchAll(/^model (\w+)/gm)].map((m) => m[1]);
    expect(models.length).toBeGreaterThan(0);
    for (const model of models) {
      const lc = model[0].toLowerCase() + model.slice(1);
      expect(
        grepReferences(model, lc),
        `Prisma model "${model}" has no references in src/ or prisma/seed.js`
      ).toBeTruthy();
    }
  });
});

function grepReferences(...terms: string[]): boolean {
  const { execSync } = require("node:child_process") as typeof import("node:child_process");
  try {
    const out = execSync(
      `grep -rlw -e '${terms[0]}' -e '${terms[1]}' src prisma/seed.js 2>/dev/null | grep -v '__tests__' || true`,
      { encoding: "utf8" }
    );
    return out.trim().length > 0;
  } catch {
    return false;
  }
}

describe("CMS regression: three separate inquiry types", () => {
  // The training form used to POST to /api/trip-inquiries and pack institution,
  // field of study and experience into a message blob, so internship applicants
  // were indistinguishable from safari customers.
  it("internship applications post to the internship endpoint, not trip inquiries", () => {
    const src = read("domains/training/components/TrainingApplicationForm.tsx");
    expect(src).toContain('fetch("/api/internship-inquiries"');
    expect(src).not.toContain('fetch("/api/trip-inquiries"');
  });

  it("the internship form sends structured fields instead of a message blob", () => {
    const src = read("domains/training/components/TrainingApplicationForm.tsx");
    expect(src).toContain("university: formData.institution");
    expect(src).toContain("fieldOfStudy: formData.fieldOfStudy");
    expect(src).toContain("experience: formData.experience");
    expect(src).toContain("preferredStartDate: formData.startDate");
    // The old blob format stuffed everything into `message`.
    expect(src).not.toContain("[Training Application]");
  });

  it("each inquiry type has its own model, admin route and admin page", () => {
    const schema = readRepo("prisma/schema.prisma");
    for (const model of ["Inquiry", "TripInquiry", "InternshipInquiry"]) {
      expect(schema).toContain(`model ${model} {`);
    }
    for (const slug of ["inquiries", "trip-inquiries", "internship-inquiries"]) {
      expect(() => read(`app/api/admin/${slug}/route.ts`)).not.toThrow();
      expect(() => read(`app/api/admin/${slug}/[id]/route.ts`)).not.toThrow();
      expect(() => read(`app/admin/(protected)/${slug}/page.tsx`)).not.toThrow();
    }
  });

  it("the three public forms hit three different endpoints", () => {
    expect(read("app/api/contact/route.ts")).toContain("prisma.inquiry.create");
    expect(read("app/api/trip-inquiries/route.ts")).toContain("prisma.tripInquiry.create");
    expect(read("app/api/internship-inquiries/route.ts")).toContain(
      "prisma.internshipInquiry.create"
    );
  });

  it("no public form writes to another inquiry's table", () => {
    const routes: Record<string, string> = {
      "app/api/contact/route.ts": "inquiry",
      "app/api/trip-inquiries/route.ts": "tripInquiry",
      "app/api/internship-inquiries/route.ts": "internshipInquiry",
    };
    for (const [file, ownModel] of Object.entries(routes)) {
      const src = read(file);
      for (const other of Object.values(routes)) {
        if (other === ownModel) continue;
        expect(
          src,
          `${file} writes to prisma.${other}, which belongs to a different form`
        ).not.toContain(`prisma.${other}.create`);
      }
    }
  });

  it("internship pages are reachable from the admin sidebar", () => {
    expect(read("components/layout/AdminSidebar.tsx")).toContain(
      'href: "/admin/internship-inquiries"'
    );
  });

  it("the internship editor manages every collected field", () => {
    const src = read("app/admin/(protected)/internship-inquiries/page.tsx");
    for (const field of [
      "name",
      "email",
      "phone",
      "country",
      "university",
      "fieldOfStudy",
      "programType",
      "preferredStartDate",
      "duration",
      "experience",
      "message",
      "status",
      "read",
      "archived",
    ]) {
      expect(src, `internship editor is missing "${field}"`).toContain(`name: "${field}"`);
    }
    // Boolean archive column, not the status enum.
    expect(src).toContain('archiveField: "archived"');
  });

  it("programme types come from one shared definition", () => {
    const validation = read("lib/validation.ts");
    expect(validation).toContain("export const PROGRAM_TYPE_VALUES");
    expect(validation).toContain("export const PROGRAM_TYPE_LABELS");
    // Admin editor and public form must not each hardcode their own list.
    expect(read("app/admin/(protected)/internship-inquiries/page.tsx")).toContain(
      "PROGRAM_TYPE_VALUES.map"
    );
    expect(read("domains/training/components/TrainingApplicationForm.tsx")).toContain(
      "PROGRAM_TYPE_VALUES.map"
    );
    expect(read("app/api/internship-inquiries/route.ts")).not.toContain('INTERNSHIP: "Internship"');
  });

  it("dashboard stats track internships instead of quotes and consultations", () => {
    const stats = read("app/api/admin/stats/route.ts");
    expect(stats).toContain("prisma.internshipInquiry.count");
    expect(stats).not.toContain("quoteRequest");
    expect(stats).not.toContain("consultationRequest");
    const dashboard = read("app/admin/(protected)/dashboard/page.tsx");
    expect(dashboard).toContain("internshipInquiries");
    expect(dashboard).not.toContain("dataKey=\"consultations\"");
  });

  it("lead emails dropped the removed quote/consultation types", () => {
    const src = read("lib/services/email.ts");
    expect(src).toContain('type: "inquiry" | "internship"');
    expect(src).not.toContain('"quote" | "consultation"');
    expect(read("app/api/internship-inquiries/route.ts")).toContain(
      'sendLeadConfirmation(parsed.data.email, "internship")'
    );
  });

  it("the Apply Now CTA targets the on-page form", () => {
    expect(read("app/training/page.tsx")).toContain('id="apply"');
    expect(read("app/training/page.tsx")).toContain('href="#apply"');
  });
});
