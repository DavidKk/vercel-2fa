# Signet: navigation and information architecture plan

This document captures background, goals, and draft options for incremental design and implementation.

**Nav:** [1. Background](#1-background) · [2. Principles](#2-principles-summary) · [3. Requirements](#3-requirements) · [4. Route baseline](#4-route-baseline) · [5. Module split](#5-frontend-module-split) · [5.4 Header + mobile](#54-header-multi-module--mobile) · [6. Content rules](#6-content--presentation) · [7. Styling](#7-styling--tokens) · [8. Rollout order](#8-rollout-order) · [9–10. Risks & open questions](#9-risks--dependencies)

---

## 1. Background

The app combines **standard login (TOTP / WebAuthn)**, **OAuth/ECDH demo + Playground**, **onboarding docs**, and **utility pages**. The header (`app/Nav`) groups links but does not clearly separate **primary vs secondary** paths.

In practice:

- **Integrators / users** want fast auth and return to the app; with an **existing session**, they should not be forced through the full interactive login again.
- **Docs** stay important but should be **secondary**, not competing for first-screen focus.
- **Tool pages** (keys, QR, credential helpers) fit a **developer tools** mental model.
- **Playground** differs from **production login** in risk and expectations; navigation and layout should **label it explicitly** to avoid confusion.
- **Agents** need a stable **HTTP MCP** (or equivalent function-calling), mirroring **vercel-web-scripts** (GET manifest, JSON-RPC POST, `/api/mcp/headers`, server-side auth headers).

---

## 2. Principles (summary)

| Principle          | Meaning                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| Login first        | Nav + home default to **Sign in / resume session**; docs/tools secondary                                     |
| Session continuity | Logged-in visits to `/login` or `redirectUrl` flows should **short-circuit** instead of repeating challenges |
| Clear zones        | Getting Started, Tools, Playground, (future) MCP docs are **separate groups** with consistent naming         |
| Visual refresh     | New header + layout tokens (spacing, hierarchy, primary color), moving off a single indigo bar               |
| Security unchanged | Open redirects, OAuth, MCP keep allowlists, auth, and audit boundaries                                       |

---

## 3. Requirements

### 3.1 Login as hub + “bounce when already signed in”

**Intent:**  
The login page is an **auth gateway**: when the request has a valid `redirectUrl` (and optional `state`) **and** the browser already has a **valid session** (HTTP-only cookie / server-verifiable session JWT), the app should:

- **Skip** TOTP/WebAuthn UI;
- Follow existing security rules for **token issue or redirect** (aligned with Blank/OAuth callbacks) and send the user back.

This matches “silent login / session continuation”; align with **token TTL, device binding, replay protection**.

**Draft approach:**

- At the start of **`/login` (and OAuth entry if needed)**, add **session detection** on the server: if verified and policy passes, take the **success path** (redirect to `redirectUrl` with agreed params, or one-time ticket page).
- Define **which routes** short-circuit (only `/login` + parameterized jump vs `/oauth` edge cases).
- Copy: full flow when logged out; when logged in, a short “Signed in, redirecting…” line or immediate redirect.

**Open details:** session shape (single vs dual cookie), whether short-circuit reuses `generateToken`, `redirectUrl` parity with today, `prompt=none`-style contracts.

### 3.2 Getting Started (TOTP + WebAuthn + 2FA) — non-core

Keep **Getting Started** content as **secondary**; not the default task flow.

**Draft:** Nav group **Docs** or **Guide** → `/getting-started`. Home primary CTA = login; docs as secondary cards or footer.

**Open:** merge `/totp`, `/webauthn` into GS anchors vs keep standalone pages + deep links.

### 3.3 Tools (ECDH key pair, TOTP QR, WebAuthn credential, …)

Aggregate existing capabilities under **Tools** (or **Developer tools**), not under the same heading as login.

**Draft:** Map `/ecdh`, `/totp`, `/webauthn`; badge hybrid **Tool / Doc** pages. Refactor `DEFAULT_NAV` to **Login (prominent)** | Docs | Tools | Playground | MCP (doc anchor or `/api/mcp`).

**Open:** optional `/tools/*` prefix for caching/permissions.

### 3.4 Playground — keep, distinguish from login

**OAuth Playground** (`/oauth/playground`) is for **trying callbacks**; not production login. Use nav label, color, or icon for **Demo / Sandbox**.

**Draft:** Group **Playground** or **Sandbox**; optional top strip: “Debug OAuth flows here; use **Sign in** for production.”

**Open:** how it sits next to `/oauth` in the nav.

### 3.5 MCP (match web-scripts)

Expose **HTTP MCP** (GET manifest + POST tools) so agents call **stable tool names** over **JSON-RPC** (and optional legacy `{ tool, params }`): health, **read-only / generative** login-adjacent helpers (not human TOTP/WebAuthn), token savings vs OpenAPI.

**Reference (vercel-web-scripts):** `initializer/mcp/`, `app/api/mcp/route.ts`, `app/api/mcp/headers/route.ts`, `SCRIPTS_MCP_HEADERS`, session cookie or API key.

**Draft for Signet:** add **`/api/mcp`** (+ optional **`/api/mcp/headers`**`), `VERCEL_2FA_MCP_HEADERS`, conservative **read + generate** tools (allowlist checks, ECDH test keys, integration doc URIs).

**Open:** tool allowlist, rate limits, `integrationAuth`, `resources/read` for README snippets.

### 3.6 Global layout + header

Rebuild **global nav and key layouts**: header (logo / primary CTA / groups / mobile drawer), type scale, light/dark if kept.

**Draft:** design tokens (CSS vars or Tailwind), replace flat `bg-indigo-500` bar; **brand left / nav center / GitHub + optional session right**; **Sign in** stays obvious on small screens.

**Open:** Headless UI / Radix vs current stack; internal tool vs Vercel brand.

**Do tokens + shell first, then per-page reskin.**

---

## 4. Route baseline

| Route                         | Type              | Notes                                       |
| ----------------------------- | ----------------- | ------------------------------------------- |
| `/`                           | Marketing / entry | After rework: primary CTA = go to login     |
| `/login`                      | **Auth gateway**  | TOTP/WebAuthn; future session short-circuit |
| `/login/blank`                | Post-auth view    | Token / claims                              |
| `/oauth`                      | OAuth gateway     | ECDH + encrypted token                      |
| `/oauth/playground`           | **Sandbox**       | Debug; visually separate from prod login    |
| `/getting-started`            | Doc hub           | Overview / Env / Integration                |
| `/totp`, `/webauthn`, `/ecdh` | Tool-heavy        | **Tools** group in nav                      |

**Assist Sidebar** (`AssistSidebar*`): agree z-index / focus order with the header (see §7.4).

---

## 5. Frontend module split

Order: **shell → nav → page templates → feature blocks → tokens**; avoid one mega-`Nav` file.

### 5.1 Logical shell

```
AppShell (root layout)
├── AppHeader (sticky)
├── OptionalRouteBanner (Sandbox routes only)
├── Main (max-width + horizontal padding + min-height)
│   └── PageTemplate (per route)
└── AssistSidebar (floating; z-index coordinated with header)
```

### 5.2 Suggested code modules

| Module                | Path idea                                              | Responsibility                        | Excludes        |
| --------------------- | ------------------------------------------------------ | ------------------------------------- | --------------- |
| **Design Tokens**     | `:root` in `app/globals.css` or `app/styles/theme.css` | Colors, type scale, `--header-height` | Copy strings    |
| **AppShell**          | `app/layout.tsx` + optional `AppShell.tsx`             | Providers, fonts, `main` wrapper      | Login form body |
| **AppHeader**         | `components/AppHeader/` or refactored `app/Nav/`       | Brand, nav, CTA, GitHub, drawer       | Page body       |
| **Navigation Config** | `config/navigation.ts` (from `constants.ts`)           | Groups, `href`, badges, `variant`     | Raw CSS numbers |
| **Nav Primitives**    | `NavLink`, `NavGroup`, `MobileDrawer`, `ToolsMenu`     | a11y, keyboard, hover/active          | Auth policy     |
| **Page Templates**    | `components/page-templates/*.tsx`                      | Title area, optional breadcrumb       | Domain crypto   |
| **Feature Blocks**    | per-route `components/*`                               | Forms, QR, PEM UI                     | Header          |

### 5.3 Page templates (by user task)

Shared vertical rhythm; pages pass **title / description / body**.

| Template                | Routes                        | Layout notes                                                           |
| ----------------------- | ----------------------------- | ---------------------------------------------------------------------- |
| **HomeTemplate**        | `/`                           | Hero + **single primary CTA (Sign in)**; secondary Docs/Tools cards    |
| **AuthGatewayTemplate** | `/login`, `/oauth`            | Centered card; `--color-bg`; minimal distraction links                 |
| **PostAuthTemplate**    | `/login/blank`                | Wider reading width; monospace claims; muted secondary actions         |
| **DocHubTemplate**      | `/getting-started`            | ~65ch body; code blocks; optional anchor sidebar                       |
| **ToolPageTemplate**    | `/totp`, `/webauthn`, `/ecdh` | Title + one-liner + tool area + collapsible “how it works / caveats”   |
| **PlaygroundTemplate**  | `/oauth/playground`           | **Sandbox banner** (§6.4) + debug controls; distinct surface from auth |

Template props: `title`, `description?`, `children`, `variant?` — avoid repeating `container mx-auto py-10` everywhere.

### 5.4 Header (many modules + mobile)

Too many top-level links → **one config + two layouts (desktop row / mobile drawer)**.

#### 5.4.1 IA: three entry types

| Type               | Contents                                                                    | Interaction                                                                    |
| ------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Primary links**  | Docs → `/getting-started`, Playground → `/oauth/playground`, MCP doc anchor | Desktop: inline; mobile: drawer rows                                           |
| **Grouped**        | Tools: ECDH, TOTP, WebAuthn                                                 | Desktop: dropdown / disclosure; mobile: **Accordion** “Tools” with three items |
| **Global actions** | Sign in, GitHub                                                             | Distinct from nav groups (button / icon)                                       |

Rule: **do not put 7+ sibling links on a narrow top row**; Tools must collapse.

#### 5.4.2 Desktop (≥ md)

```
[ Logo ]   Docs   [ Tools ▾ ]   Playground   MCP      [ Sign in ]   [GitHub○]
```

- **Tools ▾**: vertical list + optional icons; fixed `min-w-[12rem]`.
- **Playground**: `variant: sandbox` tokens (muted text or left accent).
- **Sign in**: only **primary** solid button; GitHub **ghost** icon.
- **Keyboard:** Tab order Logo → links → Tools children → CTA → GitHub; **Esc** closes Tools panel and returns focus to trigger.

#### 5.4.3 Mobile (< md) — recommended

Sticky bar:

```
[ Logo ]                    [ Sign in ]   [ ☰ ]
```

- **Sign in stays visible** — integrators never open the menu just to log in.
- **Hamburger = nav only**, not login.

**Drawer order:**

1. Optional muted line (“Docs & tools”) or skip.
2. **Docs**, **Playground**, **MCP** — full-width rows (`min-h-[44px]`).
3. **Tools** accordion → ECDH / TOTP / WebAuthn indented.
4. **GitHub** near bottom.

**Drawer behavior:** lock body scroll, focus trap, **Esc** closes, restore focus to menu button, **z-index** above Assist trigger.

#### 5.4.4 Config-driven

Example `config/navigation.ts`:

```text
sections: [
  { type: 'link', id: 'docs', label, href },
  { type: 'group', id: 'tools', label, items: [{ label, href, icon? }, ...] },
  { type: 'link', id: 'playground', label, href, variant: 'sandbox' },
  { type: 'link', id: 'mcp', label, href, external?: false },
]
actions: [
  { type: 'cta', id: 'sign-in', label, href, prominence: 'primary' },
  { type: 'icon', id: 'github', href, ariaLabel },
]
```

Same structure rendered by **`AppHeaderDesktop`** and **`AppHeaderMobileDrawer`**.

#### 5.4.5 a11y + SEO

- Menu button: `aria-expanded`, `aria-controls` → drawer id.
- Current route: `aria-current="page"` on active `NavLink` (desktop + drawer).
- Internal anchors: no `target=_blank`; external only with `rel`.

#### 5.4.6 Boundaries

- **OptionalRouteBanner** sits **below** the header (not double-stacked in the bar).
- **Assist Sidebar:** drawer wins z-index; optionally hide Assist trigger while drawer is open.

---

## 6. Content & presentation

### 6.1 AppHeader

| Block       | Contents                                          | Rules                                                    |
| ----------- | ------------------------------------------------- | -------------------------------------------------------- |
| Brand       | Product name → `/`                                | Left; heavier than nav links                             |
| Primary nav | Docs, Tools (ECDH/TOTP/WebAuthn), Playground, MCP | Center-left; Playground uses sandbox styling / badge     |
| Primary CTA | “Sign in” → `/login`                              | **Only** solid primary CTA site-wide (`--color-primary`) |
| Secondary   | GitHub                                            | Icon button; circular hover                              |
| Optional    | Signed-in state                                   | Only when reliable; avoid flicker                        |

Mobile: **§5.4.3** — Sign in fixed in bar; links in drawer + Tools accordion.

### 6.2 Docs

| Contents                          | Rules                                            |
| --------------------------------- | ------------------------------------------------ |
| Existing Getting Started sections | **DocHubTemplate**; consistent `h2/h3` + spacing |
| Cross-links to tools              | Inline links like “Open TOTP QR tool → `/totp`”  |

### 6.3 Tools

| Page        | Contents                       | Rules                                                              |
| ----------- | ------------------------------ | ------------------------------------------------------------------ |
| `/ecdh`     | Keys, PEM, copy, notes         | **ToolPageTemplate**; monospace + copy; warn “demo keys, not prod” |
| `/totp`     | Secret, issuer, account, QR    | Grid alignment; fixed QR size to limit CLS                         |
| `/webauthn` | Registration / assertion demos | Short stepper; inline errors                                       |

Nav: three items under **Tools**; optional small icons.

### 6.4 Playground

| Contents       | Rules                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| OAuth debug UI | **PlaygroundTemplate** + top **OptionalRouteBanner** (amber/neutral + border): “Sandbox · OAuth debugging, not production login” |
| Visual diff    | `--color-surface-muted` or dashed border; not the same card chrome as `/login`                                                   |

### 6.5 Login gateway

| Contents                        | Rules                                                                      |
| ------------------------------- | -------------------------------------------------------------------------- |
| TOTP/WebAuthn, invalid redirect | **AuthGatewayTemplate**; illegal redirect uses same alert tokens as global |
| Session short-circuit (planned) | Logged-in: **no form flash** (short spinner or immediate 302)              |

### 6.6 MCP

| Contents                            | Rules                                                              |
| ----------------------------------- | ------------------------------------------------------------------ |
| Human-facing: endpoint, auth, tools | GS section **Agent / MCP**; table of tool name, risk, key required |
| Nav entry                           | “MCP” → doc anchor; **never show secrets in the nav**              |

---

## 7. Styling & tokens

### 7.1 Recommended order

1. **Tokens** — semantic vars only; no magic colors in random TSX.
2. **AppHeader + primitives + nav config** — sandbox vs default styling.
3. **Five templates + one reference page each.**
4. **OptionalRouteBanner** — playground (+ future sandboxes).
5. **Migrate remaining pages**; then dark mode / motion if kept.

### 7.2 Suggested tokens (values TBD)

| Token                                       | Use case                          |
| ------------------------------------------- | --------------------------------- |
| `--color-bg`                                | Page background                   |
| `--color-surface` / `--color-surface-muted` | Cards, playground surfaces        |
| `--color-border` / `--color-border-dashed`  | Dividers, sandbox borders         |
| `--color-text` / `--color-text-muted`       | Body / secondary                  |
| `--color-primary` / `--color-primary-hover` | Sign in                           |
| `--color-accent-warning`                    | Playground banner                 |
| `--color-danger`                            | Errors, bad redirect              |
| `--header-height`                           | Header + content padding-top      |
| `--radius-card`, `--shadow-card`            | Login card; softer for playground |

### 7.3 Desktop IA sketch

```
[ Logo · Product ]    Docs ▾    Tools ▾    Playground ⧉    MCP          [ Sign in ]   [ GitHub ○ ]
```

### 7.4 Assist vs header

- **z-index:** drawer above Assist trigger (or hide Assist while open).
- **Color:** primary only on **Sign in**; Assist stays neutral.

### 7.5 Breakpoints

| Breakpoint | Behavior                          |
| ---------- | --------------------------------- |
| `< md`     | Hamburger; Tools as single column |
| `≥ md`     | Horizontal groups; Tools dropdown |

---

## 8. Rollout order (features + visuals)

1. **Nav config + AppHeader skeleton** (old colors OK).
2. **Design tokens** replacing hard-coded bar colors.
3. **Five templates + reference pages.**
4. **Session short-circuit** on `/login` + redirect test matrix.
5. **Playground banner + template.**
6. **MCP v1** + GS “Agent / MCP” section.
7. **Optional:** `/tools/*` routes, header session chip, dark mode.

---

## 9. Risks & dependencies

- **Short-circuit** done wrong → **open redirect / token abuse**: reuse `isAllowedRedirectUrl` and cookie rules.
- **MCP** widens surface → **API key** (or equivalent) and minimal default tools.
- **Playground vs prod login** needs **template + banner + border tokens**, not copy alone.
- **Template sprawl:** cap at these six types; new pages must map to a template before adding variants.

---

## 10. Open questions

1. “Already signed in, bounce away” — **same-site `redirectUrl` only**, or any allowlisted third-party origin?
2. Short-circuit: **fresh JWT** (`iat`/`exp`) or reuse session token?
3. Which MCP actions are **forbidden** (e.g. never “complete 2FA for the user”)?
4. Should the default landing be **`/login`** or keep `/` with login-only hero?
5. **Tools:** ship `/tools/totp` etc. in v1, or only regroup nav + templates?

---

**Doc version: draft v2.1 (EN)**  
v2: route baseline, module split, templates, content rules, tokens. **v2.1:** §5.4 desktop/mobile header, config-driven nav, a11y notes.
