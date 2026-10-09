import { expect, test } from "@playwright/test";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 900, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

test.describe("homepage image sections", () => {
  for (const viewport of viewports) {
    test(`image sections render correctly at ${viewport.name} width`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const consoleErrors: string[] = [];
      const failedRequests: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 160));
      });
      page.on("requestfailed", (req) => failedRequests.push(req.url().slice(0, 120)));

      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Scroll through the page so lazy-loaded images enter the viewport and decode.
      await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
          let y = 0;
          const step = () => {
            y += window.innerHeight * 0.7;
            window.scrollTo(0, y);
            if (y < document.documentElement.scrollHeight) setTimeout(step, 80);
            else resolve();
          };
          step();
        });
      });
      // Wait for the critical images we assert on to finish loading/decoding.
      // (Waiting for EVERY image is intentionally avoided: a fresh headless
      // browser can crash decoding the full set at once. No fixed long sleep.)
      await page
        .waitForFunction(
          () => {
            const crit = Array.from(
              document.querySelectorAll(".destination-card img, .experience-image img, .package-image img")
            );
            return crit.length > 0 && crit.every((img) => (img as HTMLImageElement).complete);
          },
          { timeout: 20000 }
        )
        .catch(() => {});
      await page.evaluate(() => window.scrollTo(0, 0));

      // ── Required sections are present ────────────────────────────────
      for (const selector of [
        ".safari-hero",
        ".partners-section",
        ".intro-section",
        ".destinations-section",
        ".experiences-section",
        ".safari-package",
        ".gallery-editorial",
        ".safari-footer",
      ]) {
        await expect(page.locator(selector).first()).toBeVisible();
      }

      // ── Destinations gallery has a nonzero, reasonable height ─────────
      const grid = page.locator(".destination-editorial-grid");
      await expect(grid).toBeVisible();
      const gridHeight = await grid.evaluate((el) => el.getBoundingClientRect().height);
      expect(gridHeight).toBeGreaterThan(250);

      // ── Images load successfully (complete + natural dimensions) ──────
      const images = page.locator(".destination-card img, .experience-image img, .package-image img");
      await expect(images.first()).toBeVisible();
      await expect
        .poll(() =>
          images.evaluateAll((items) =>
            items.every((img) => {
              const el = img as HTMLImageElement;
              return el.complete && el.naturalWidth > 0;
            })
          )
        )
        .toBe(true);

      // ── Images fill their containers (no unintended blank regions) ───
      const fillCheck = await page.evaluate(() => {
        const containers = Array.from(
          document.querySelectorAll(".destination-card, .experience-image, .package-image")
        );
        const bad: string[] = [];
        for (const c of containers) {
          const img = c.querySelector("img");
          if (!img) continue;
          const cr = c.getBoundingClientRect();
          const ir = img.getBoundingClientRect();
          // The image should cover at least 90% of the container's height and width.
          const hRatio = cr.height > 0 ? ir.height / cr.height : 0;
          const wRatio = cr.width > 0 ? ir.width / cr.width : 0;
          if (hRatio < 0.9 || wRatio < 0.9) {
            const msg =
              c.className +
              " img " +
              Math.round(ir.width) +
              "x" +
              Math.round(ir.height) +
              " in " +
              Math.round(cr.width) +
              "x" +
              Math.round(cr.height);
            bad.push(msg);
          }
        }
        return bad;
      });
      expect(fillCheck, "images not filling containers: " + fillCheck.join(", ")).toEqual([]);

      // ── No unintended horizontal overflow ─────────────────────────────
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);

      // ── No unexpected console errors or failed requests ──────────────
      // Filter a known PRE-EXISTING local-only artifact: running the production
      // build with `next start` regenerates the per-request CSP nonce on every
      // response, mismatching the script nonces baked into the ISR-cached HTML.
      // This does not occur on Vercel (the CSP header is cached with the ISR
      // response), so it is not a site defect and is unrelated to the image fixes.
      // Any OTHER console error fails the test.
      const preExistingNonce = /Content Security Policy directive 'script-src/;
      const unexpectedErrors = consoleErrors.filter((e) => !preExistingNonce.test(e));
      expect(unexpectedErrors, `console errors: ${unexpectedErrors.join(" | ")}`).toEqual([]);
      expect(failedRequests, `failed requests: ${failedRequests.join(" | ")}`).toEqual([]);
    });
  }
});

test("homepage has no major layout shift", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    const w = window as unknown as { __cls: number };
    w.__cls = 0;
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (!(e as { hadRecentInput?: boolean }).hadRecentInput) {
            w.__cls += (e as { value?: number }).value ?? 0;
          }
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch {
      /* PerformanceObserver layout-shift unsupported */
    }
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  // Measure CLS from the above-the-fold imagery (the hero). Below-the-fold
  // images are lazy and don't load without scrolling, so they don't affect
  // initial CLS. Wait for the hero to finish loading (no fixed long sleep).
  await page
    .waitForFunction(
      () => {
        const hero = document.querySelector(".safari-hero img") as HTMLImageElement | null;
        return hero !== null && hero.complete && hero.naturalWidth > 0;
      },
      { timeout: 20000 }
    )
    .catch(() => {});
  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls).toBeLessThan(0.1);
});
