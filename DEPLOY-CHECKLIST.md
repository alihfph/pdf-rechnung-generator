# Deploy checklist: Backend (Railway) + Frontend (Vercel)

Use this when setting up env vars and connecting the two.

---

## 1. Railway – Backend service variables

In your **Railway project** → select the **backend service** (not Redis) → **Variables** tab → **Add variable** (or **RAW Editor**). Add:

| Variable        | Value |
|-----------------|-------|
| `JWT_SECRET`    | `be1607512c82bfe691cc195ba90acd066776a97a0c99456d1726c5a16f652c06` |
| `ADMIN_EMAIL`   | `partap.singh@example.com` |
| `ADMIN_PASSWORD`| `Germany1234` |

- **`REDIS_URL`** (required): If you added a **Redis** service in the same Railway project, open the **Redis** service → **Variables** (or **Connect** tab) → copy **`REDIS_URL`** or **`REDIS_PRIVATE_URL`**, then in the **backend** service → **Variables** → add `REDIS_URL` = that value.  
  If you don’t have Redis in the project: **+ New** → **Database** → **Redis**, then link/copy its URL into the backend’s `REDIS_URL`.  
  **If `REDIS_URL` is missing or wrong you get `ECONNREFUSED` / ioredis errors.**

---

## 2. Railway – Public URL

- Backend service → **Settings** → **Networking** → **Generate Domain**.
- Copy the URL (e.g. `https://pdf-rechnung-generator-production.up.railway.app`).  
- No trailing slash.

---

## 3. Vercel – Frontend env and redeploy

- Open **Vercel** → your **frontend project** (e.g. pdf-rechnung-generator-ali).
- **Settings** → **Environment Variables**.
- Add:
  - **Name:** `VITE_API_URL`
  - **Value:** the Railway URL from step 2 (e.g. `https://xxx.up.railway.app`)
  - **Environment:** Production (and Preview if you want).
- **Save**.
- **Deployments** → **⋯** on latest → **Redeploy** (or push a new commit).

---

After redeploy, the Order page will use the backend. Log in with `partap.singh@example.com` / `Germany1234` for admin.
