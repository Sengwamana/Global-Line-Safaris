# Partner marks

Third-party marks displayed in the "Trusted By The Best" strip
(`src/domains/home/components/PartnersSection.tsx`).

Every file here was downloaded from the organisation's own published website, or
from Wikimedia Commons where the organisation's site did not serve the asset.
Nothing is traced, redrawn, recoloured or substituted.

| File | Organisation | Source | Notes |
| --- | --- | --- | --- |
| `rdb.png` | Rwanda Development Board | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:RDB_logo.jpg) | Public domain. `rdb.rw` itself completed TLS but never answered the HTTP request, so the logo was taken from Commons instead. White JPEG background removed; ink and proportions untouched. |
| `akagera-national-park.png` | Akagera National Park | `africanparks.org/sites/default/files/2018-02/akagera_logo_0.png` | Full-colour mark, as published. Transparent padding trimmed. |
| `nyungwe-national-park.png` | Nyungwe National Park | `africanparks.org/sites/default/files/2021-11/AFRICAN PARKS - Nyungwe Logo - white_0.png` | Published **solid white only**. Rendered on a dark card so it is legible; the file itself is unmodified. |
| `rwanda-tourism.png` | Visit Rwanda | `visitrwanda.com/wp-content/uploads/2018/07/footer-logo.png` | White variant, chosen to sit on the dark card. The dark variant (`header-logo.png`) exists if the card treatment changes. |
| `bpn.png` | BPN Rwanda (Business Professionals Network) | `bpn.rw/wp-content/uploads/2025/02/BPN_Logo_BGnix300dpi.png` | Full-colour mark on a transparent background, as published. Sits on the light card. |

## Deliberately not included

- **Volcanoes National Park** — rendered as a text badge. No publishable mark was
  found: `africanparks.org` has no logo file for the park, and the legacy
  `volcanoesnationalparkrwanda.org` domain is no longer operated by the park and
  now resolves to an unrelated site. The previous build linked visitors to it.
- **Lake Kivu, Congo Nile Trail, "Rwanda Safari", "Rwanda Tourism"** — these were
  never organisations. They were destinations and generic phrases rendered with
  scenic photographs as if they were logos.

## Before shipping

Marks identifying real partners should only be displayed where a genuine
relationship exists. Re-confirm RDB registration status periodically; if it lapses,
drop `rdb.png` from the strip.
