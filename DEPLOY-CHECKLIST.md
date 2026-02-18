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

- **`REDIS_URL`** (required – without this you get "Redis error" / "Connection is closed"):  
  **Option A – Reference (recommended):**  
  1. Open your **backend** service → **Variables**.  
  2. Click **Add variable** → **Add Reference** (or **Reference Variable**).  
  3. Select the **Redis** service, then the variable **`REDIS_PRIVATE_URL`** (or `REDIS_URL`).  
  4. Expose it as **`REDIS_URL`** in the backend (so the backend sees `REDIS_URL` = Redis’s private URL).  
  5. Redeploy the backend.  
  **Option B – Copy-paste:**  
  1. Open the **Redis** service → **Variables** → copy the full value of **`REDIS_PRIVATE_URL`** (or `REDIS_URL`).  
  2. Open the **backend** service → **Variables** → **New Variable** → Name: **`REDIS_URL`**, Value: paste the URL.  
  3. Redeploy the backend.  
  If you still see "Connection is closed", the backend is not getting a valid Redis URL — use Option A so the value is always correct.

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
