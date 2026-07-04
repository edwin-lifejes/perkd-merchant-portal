# CLAUDE.md — Perkd Merchant Portal

> Context map for AI agents. Read this before making any changes to the codebase.

---

## Project State — Read This First

> This section is for any developer or AI agent picking up this project. It describes what has been built, what is pending, and where the live system runs.

### What has been built and is live

| Feature | File(s) |
|---|---|
| Public landing page | `src/pages/Landing.tsx` |
| Merchant registration wizard (multi-step, draft save/load) | `src/pages/Register.tsx` |
| Login / logout (Keycloak ROPC via `/auth-config`) | `src/pages/Login.tsx`, `src/services/auth.ts` |
| Dashboard (offer counts, latest offers, profile progress banner) | `src/pages/Dashboard.tsx` |
| Profile setup (logo URL, description, lat/lng coordinates) | `src/pages/ProfileSetup.tsx` |
| Offer list with status filter tabs | `src/pages/Offers.tsx` |
| Offer editor — type picker (Step 1) + detail form (Step 2) | `src/pages/OfferEditor.tsx` |
| Offer editor — theme panel + live preview tile | `src/pages/OfferEditor.tsx` |
| Per-offer contact override (contactEmail / contactPhone) | `src/pages/OfferEditor.tsx`, `src/types/index.ts` |
| Material Symbols icon system (replaces all emoji) | `src/components/ui/Icon.tsx`, `index.html` |
| `hasAdvancedContent()` helper for future consumer tile | `src/utils/offers.ts` |

### What is NOT built yet

| Item | Notes |
|---|---|
| Image file upload | `logoUrl`/`coverPhotoUrl` are plain URL text inputs. Backend has `/generate-upload-url` but it is not wired to the UI. |
| Consumer-facing offer browse / tile | Data model is ready (`businessName`, `hasAdvancedContent`). UI not designed yet. |
| Admin portal | Separate product. Backend admin routes exist. No frontend. |
| Map picker for coordinates | `ProfileSetup` uses plain lat/lng text inputs. |
| Resubmit application flow | Backend has `PUT /merchant/application` but there is no UI for it. |
| Test suite | No test framework configured. |

### Known technical debt

- `Register.tsx` uses react-hook-form + zod; all other forms use controlled `useState`. The two patterns coexist.
- Draft registration ID is kept in component state only — not URL-persisted. A page refresh mid-registration loses the draft link.
- Token refresh is reactive (on 401), not proactive. Tokens could expire mid-session before the next API call triggers a refresh.
- Legacy vendor system routes on the backend (`/createStore`, `/updateStore`, `/myStores`, etc.) are dead code waiting to be removed.

---

## Infrastructure

### Live servers

| Role | IP | Domain | SSH |
|---|---|---|---|
| Frontend | `138.197.149.94` | `lifejes.com` | `ssh root@138.197.149.94` |
| Backend + Keycloak | `146.190.116.175` | `techjesinovation.com` | `ssh root@146.190.116.175` |

### Frontend server (`138.197.149.94`)
- nginx serves static files from `/var/www/lifejes_react/`
- nginx config: `/etc/nginx/sites-enabled/lifejes`
- `try_files $uri $uri/ /index.html` enables React client-side routing

### Backend server (`146.190.116.175`)
- Node.js backend at `/root/lifejes-be-gateway/`, port 3233
- Managed by PM2 — process name `lifejes-backend`
- Keycloak runs in Docker, proxied at `https://techjesinovation.com/auth/`
- Keycloak admin console: `https://techjesinovation.com/auth/admin/` → switch to realm `lifejes`

### Deployment commands

**Frontend (run from this repo's root):**
```bash
rm -f .env.local
npm run build
rsync -avz --delete dist/ root@138.197.149.94:/var/www/lifejes_react/
echo "VITE_API_URL=http://localhost:3233" > .env.local
```

**Backend (SSH into server):**
```bash
ssh root@146.190.116.175
cd /root/lifejes-be-gateway
git pull && npm install && npm run build && pm2 restart lifejes-backend
```

---

## CRITICAL: Environment & Deployment Rules

> **These rules exist because a localhost URL was once baked into a production build, breaking login for all users. Follow them without exception.**

### Environment files — what goes where

| File | Committed? | Purpose |
|---|---|---|
| `.env.example` | YES | Template only — must contain no real values, only `http://localhost:3233` placeholder |
| `.env` | NO (gitignored) | Local dev — copy of `.env.example`, never commit |
| `.env.local` | NO (gitignored) | Local overrides — never commit |
| `.env.production` | YES | Production values — `VITE_API_URL=https://techjesinovation.com` |

**Rule: Never put `localhost` or `127.0.0.1` in any file that is committed to git.**

A pre-commit hook enforces this. It will block any commit that stages `.env`, `.env.local`, or any env file containing `localhost`.

### Vite build env priority (highest → lowest)

1. `.env.local` — **loaded even by `vite build`** — if this file exists it overrides `.env.production`
2. `.env.production` — correct source of truth for prod builds
3. `.env` — base fallback

**Before running `npm run build` for production, delete or rename `.env.local`.**  
Use `.env.production` as the sole source of production config.

---

## Pre-deployment Checklist

Run through this checklist every time before deploying to `https://lifejes.com/`:

- [ ] **No `.env.local` present** — delete it before building: `rm -f .env.local`
- [ ] **`.env.production` exists and points to `https://techjesinovation.com`** — `cat .env.production`
- [ ] **Build is clean** — `npm run build` completes with zero TypeScript errors
- [ ] **Bundle does not contain localhost** — `grep -r 'localhost' dist/` should return nothing
- [ ] **All changes committed** — `git status` shows a clean working tree (except gitignored files)
- [ ] **PR reviewed and merged** before deploying (do not deploy uncommitted changes)
- [ ] **Deploy with rsync** — `rsync -avz --delete dist/ root@138.197.149.94:/var/www/lifejes_react/`
- [ ] **Smoke test after deploy** — open `https://lifejes.com/`, log in, verify no 500 errors in Network tab

---

## What This Is

The **Perkd Merchant Portal** is a React single-page application (SPA) that lets business owners (merchants) manage their presence on the Perkd platform. Merchants use it to:

- Register and onboard their business
- Complete their profile (logo, description, location coordinates)
- Create, edit, activate, pause, and delete promotional **Offers** visible to Perkd end-users
- Monitor offer status and account application state from a dashboard

Perkd is a consumer loyalty/perks platform. Merchants publish deals; consumers discover and redeem them via a separate consumer-facing product. This portal is **merchant-only**.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Language | TypeScript ~6 |
| Build tool | Vite 8 |
| Routing | react-router-dom v7 |
| HTTP client | axios v1 |
| Forms | react-hook-form v7 + zod v4 (installed, partially used) |
| Notifications | react-hot-toast v2 |
| Linting | ESLint 10 + typescript-eslint |
| Styling | Plain CSS via `src/index.css` and `src/App.css` (CSS custom properties, no CSS framework) |

No test framework is configured yet.

---

## How to Run

### Prerequisites
- Node.js 20+
- The backend API running (see [lifejes-be-gateway](../lifejes-be-gateway))

### Environment
Copy `.env.example` to `.env` and set:
```
VITE_API_URL=http://localhost:3233
```
The default points to the local backend. In production this changes to the deployed API base URL.

### Commands
```bash
npm install       # install dependencies
npm run dev       # start dev server (Vite HMR) — typically http://localhost:5173
npm run build     # TypeScript check + Vite production build → dist/
npm run preview   # serve the dist/ build locally
npm run lint      # run ESLint
```

---

## Project Structure

```
perkd-merchant-portal/
├── src/
│   ├── main.tsx                  # Entry — mounts <App> inside BrowserRouter
│   ├── App.tsx                   # Route definitions + ProtectedRoute guard
│   ├── App.css                   # Global component styles (nav, forms, cards, etc.)
│   ├── index.css                 # CSS custom properties / design tokens
│   │
│   ├── context/
│   │   └── AuthContext.tsx       # Auth state (isAuthenticated, login, logout)
│   │
│   ├── services/
│   │   ├── api.ts                # Axios instance, token storage, auto-refresh interceptor
│   │   ├── auth.ts               # Login, register, draft save/load, token refresh
│   │   ├── merchant.ts           # Dashboard, profile, progress, provinces, categories
│   │   └── offers.ts             # Offer CRUD + status transitions (activate, pause, delete)
│   │
│   ├── types/
│   │   └── index.ts              # All shared TypeScript interfaces and types
│   │
│   ├── pages/
│   │   ├── Landing.tsx           # Public marketing/landing page
│   │   ├── Login.tsx             # Email + password login form
│   │   ├── Register.tsx          # Multi-step merchant registration wizard
│   │   ├── Dashboard.tsx         # Post-login home: stats, latest offers, profile banner
│   │   ├── ProfileSetup.tsx      # Guided profile completion (logo → description → coordinates)
│   │   ├── Offers.tsx            # Full offer list with status filter tabs
│   │   └── OfferEditor.tsx       # Create / edit offer (step 1: type picker, step 2: form)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppNav.tsx        # Top navigation bar (brand + business name + sign out)
│   │   │   └── DashboardLayout.tsx # Wrapper: AppNav + page content area
│   │   └── ui/
│   │       ├── Alert.tsx         # Inline alert (info / warning / error) — uses Icon
│   │       ├── Badge.tsx         # Offer status badge (active / draft / paused / expired)
│   │       ├── Icon.tsx          # Google Material Symbols Outlined wrapper component
│   │       └── Spinner.tsx       # Loading spinner (sm / md / lg sizes)
│   │
│   ├── utils/
│   │   └── offers.ts             # hasAdvancedContent() helper for consumer tile expand affordance
│   │
│   └── assets/
│       └── hero.png              # Hero image used on the Landing page
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── index.html                    # Vite HTML entry point
├── vite.config.ts                # Vite config (plugin-react only, no proxy set up)
├── tsconfig.app.json             # TypeScript config for src/
├── tsconfig.node.json            # TypeScript config for vite.config.ts
├── eslint.config.js              # ESLint flat config
├── .env                          # Local env vars (gitignored)
└── .env.example                  # Env var template
```

---

## Authentication

Auth uses **OAuth2 Resource Owner Password Credentials (ROPC)** flow against an external auth server (Keycloak or similar).

### Flow
1. On login, the frontend first fetches `GET /auth-config` from the backend, which returns `{ tokenUrl, clientId }`.
2. It then POSTs credentials to `tokenUrl` with `grant_type=password`.
3. `accessToken` and `refreshToken` are stored in `localStorage` under keys `perkd_access_token` / `perkd_refresh_token`.
4. Every API request attaches `Authorization: Bearer <accessToken>` via an axios request interceptor.
5. On a 401, the response interceptor automatically fetches a new token via `grant_type=refresh_token`, queues concurrent failed requests, and retries them. If refresh fails, tokens are cleared and the user is redirected to `/login`.

### Auth helpers (`src/services/api.ts`)
- `getAccessToken()` / `getRefreshToken()` — read from localStorage
- `setTokens(tokens)` / `clearTokens()` — write / clear localStorage

### AuthContext (`src/context/AuthContext.tsx`)
Provides `isAuthenticated`, `isLoading`, `tokens`, `login(email, password)`, and `logout()` to the React tree. `ProtectedRoute` in `App.tsx` uses `isAuthenticated` to guard routes.

---

## API Surface

Base URL: `VITE_API_URL` (default `http://localhost:3233`). All authenticated endpoints expect `Authorization: Bearer <token>`.

All responses follow:
```ts
{ success: boolean; data?: T; message?: string; code?: string; fields?: Record<string, string> }
```

### Auth / Registration
| Method | Path | Description |
|---|---|---|
| GET | `/auth-config` | Returns `{ tokenUrl, clientId }` |
| POST | `<tokenUrl>` | OAuth2 token endpoint (login / refresh) |
| POST | `/merchant/register` | Full merchant registration → returns tokens |
| POST | `/merchant/register/draft` | Save partial registration draft |
| PUT | `/merchant/register/draft/:id` | Update draft |
| GET | `/merchant/register/draft/:id` | Load draft |

### Merchant / Profile
| Method | Path | Description |
|---|---|---|
| GET | `/merchant/dashboard` | Returns `DashboardData` (business, offerCounts, profileProgress, latestOffers) |
| GET | `/merchant/profile` | Returns `MerchantBusiness` |
| PUT | `/merchant/profile/logo` | `{ logoUrl }` |
| PUT | `/merchant/profile/description` | `{ description }` |
| PUT | `/merchant/profile/coordinates` | `{ lat, lng }` |
| GET | `/merchant/profile/progress` | Returns `ProfileProgress` |
| POST | `/merchant/profile/progress/skip` | `{ step }` — skip a profile step |

### Offers
| Method | Path | Description |
|---|---|---|
| GET | `/merchant/offers` | List offers (optional `?status=` filter) |
| POST | `/merchant/offers` | Create offer (pass `activate: true` to immediately activate) |
| GET | `/merchant/offers/:id` | Get single offer |
| PUT | `/merchant/offers/:id` | Update offer |
| DELETE | `/merchant/offers/:id` | Delete offer |
| POST | `/merchant/offers/:id/activate` | Activate a draft/paused offer |
| POST | `/merchant/offers/:id/pause` | Pause an active offer |
| GET | `/merchant/offer-templates` | Returns offer type templates (used for UI hints) |

### Reference Data
| Method | Path | Description |
|---|---|---|
| GET | `/reference/provinces` | List of `{ code, name }` for SA provinces |
| GET | `/allCategories` | Business category options `{ value, label }[]` |

---

## Key Domain Types

### MerchantBusiness
The core business entity. Status lifecycle: `pending → active` (or `need_more_info`, `suspended`). Fields include trading name, legal name, category, contact details, location, logo, opening hours.

### Offer
10 offer types, each with type-specific required fields:

| Type | Key Field(s) |
|---|---|
| `percentage_discount` | `discountPercentage` |
| `fixed_amount_discount` | `discountAmount` |
| `buy_x_get_y` | `buyQuantity`, `freeQuantity` |
| `happy_hour` | `availableTimeFrom`, `availableTimeTo`, `availableDays[]` |
| `bundle_offer` | `bundleDetails` |
| `free_item_with_purchase` | `freeItemDetails`, `minimumSpend` |
| `minimum_spend` | `minimumSpend` |
| `member_loyalty` | `eligibleItem` (reward description) |
| `limited_time` | `termsAndConditions` (urgency copy) |
| `category_specific` | `eligibleItem` (category name) |

All offers share: `title` (max 80 chars), `shortDescription` (max 200 chars), `validFrom`, `validTo`, optional `termsAndConditions`, `exclusions`, `redemptionLimit`, `availableDays[]`.

Offer status lifecycle: `draft → active ↔ paused → expired`.

### ProfileProgress
Tracks completion of 3 steps: `logo`, `description`, `coordinates`. Each step has status `not_started | completed | skipped`. `resumeStep` tells the UI where to resume. `overallStatus` is `incomplete | complete`.

---

## Routing

| Route | Auth | Component |
|---|---|---|
| `/` | Public | `Landing` |
| `/login` | Public | `Login` |
| `/register` | Public | `Register` |
| `/dashboard` | Protected | `Dashboard` |
| `/profile/setup` | Protected | `ProfileSetup` |
| `/offers` | Protected | `Offers` |
| `/offers/new` | Protected | `OfferEditor` (create mode) |
| `/offers/:id/edit` | Protected | `OfferEditor` (edit mode) |
| `*` | — | Redirects to `/` |

---

## Styling Conventions

Styling is done with plain CSS using custom properties defined in `src/index.css`. Key tokens:

- `--bg`, `--bg-2` — page and card backgrounds
- `--ink`, `--muted` — text colours
- `--sage` — primary brand green (CTAs, active states)
- `--gold` — secondary/warning colour
- `--terra` — error/danger colour
- `--hair` — border colour
- `--font-sans` — DM Sans (primary typeface)

CSS class naming is BEM-ish but informal (e.g. `form-group`, `form-label`, `btn btn-primary`, `stat-card stat-sage`). There is no CSS module system — all styles are global.

---

## Related Repositories

- **`lifejes-be-gateway`** — the backend API this portal talks to. Must be running locally for dev. Default port: `3233`.

---

## Known Gaps / Things to Be Aware Of

- **No test suite** — no unit or integration tests are set up.
- **No API proxy in Vite config** — CORS must be handled by the backend in dev, or `VITE_API_URL` must point to a running server.
- **Draft registration flow** — `Register.tsx` has a multi-step wizard with draft save/load, but the draft ID is managed in component state only (no URL persistence).
- **react-hook-form + zod** are installed as dependencies but most forms (`OfferEditor`, `ProfileSetup`) use controlled local state (`useState`) instead. Only `Register.tsx` and `Login.tsx` use RHF.
- **No image upload** — `logoUrl` and `coverPhotoUrl` are plain text URL inputs. There is no file upload flow.
- **Coordinates input** — `ProfileSetup` accepts lat/lng as text inputs. No map picker is implemented.
- **Token expiry not proactively checked** — refresh only triggers on a 401 response, not ahead of time.
