# Push to GitHub and deploy

## 1. Create the repository on GitHub

1. Go to **https://github.com/new**
2. Log in as **alihfph**
3. **Repository name:** e.g. `pdf-rechnung-generator` (or any name you like)
4. Choose **Public**, leave "Add a README" **unchecked**
5. Click **Create repository**

## 2. Use a Personal Access Token (required)

GitHub **no longer accepts your account password** for `git push`. You must use a **Personal Access Token (PAT)**:

1. On GitHub: **Profile (top right) → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. **Generate new token (classic)**  
   - Note: e.g. `pdf-rechnung-generator`  
   - Expiration: e.g. 90 days or No expiration  
   - Scopes: check **repo**
3. **Generate token** and **copy the token** (you won’t see it again).

When Git asks for a **password**, paste this token (not your GitHub account password).

## 3. Push from your machine

In the project folder, run (replace `REPO_NAME` with the repo name you chose, e.g. `pdf-rechnung-generator`):

```bash
git remote add origin https://github.com/alihfph/REPO_NAME.git
git push -u origin main
```

When prompted:
- **Username:** `alihfph`
- **Password:** paste your **Personal Access Token** (not your GitHub password)

### If push still fails

- **“Repository not found” or 404**  
  Create the repo on GitHub first (step 1 above). Name must match (e.g. `pdf-rechnung-generator`).

- **“Authentication failed” or “bad credentials”**  
  You must use a **Personal Access Token** as the password, not your GitHub account password. Create one in Settings → Developer settings → Personal access tokens (scope: **repo**).

- **“Could not read Username” / no prompt**  
  Set the remote so Git can use your token (run once, replace `YOUR_PAT` with your token):
  ```bash
  git remote set-url origin https://alihfph:YOUR_PAT@github.com/alihfph/pdf-rechnung-generator.git
  git push -u origin main
  ```
  Then remove the token from the URL:  
  `git remote set-url origin https://github.com/alihfph/pdf-rechnung-generator.git`

- **Use SSH instead** (if you use SSH keys with GitHub):
  ```bash
  git remote set-url origin git@github.com:alihfph/pdf-rechnung-generator.git
  git push -u origin main
  ```

## 4. Deploy for free

Your repo: **https://github.com/alihfph/pdf-rechnung-generator**

The app is a **frontend-only** Vite + React build. Use:

- **Build command:** `npm run build`
- **Output directory:** `dist`

You only need one of the options below. The backend (NestJS/Redis) is optional; if you use it later, deploy it separately (e.g. Railway, Render).

---

### Option A: Vercel (recommended)

1. Go to **https://vercel.com** and sign in with **GitHub**.
2. Click **Add New… → Project**.
3. Import **alihfph/pdf-rechnung-generator** (select it and continue).
4. Vercel usually detects Vite; confirm:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Root Directory:** leave empty (project root).
5. Click **Deploy**. In about a minute you get a URL like `https://pdf-rechnung-generator-xxx.vercel.app`.
6. Every push to `main` will auto-deploy.

---

### Option B: Netlify

1. Go to **https://netlify.com** and sign in with **GitHub**.
2. **Add new site → Import an existing project → GitHub** → choose **alihfph/pdf-rechnung-generator**.
3. Set:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **Deploy site**. You get a URL like `https://random-name-xxx.netlify.app`.
5. You can change the site name in **Site settings → Domain management**.

---

### Option C: GitHub Pages

1. In your repo go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. In the repo create the file below.

**`.github/workflows/deploy.yml`:**

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: false
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - id: deploy
        uses: actions/deploy-pages@v4
```

4. Commit and push. After the workflow runs, the site will be at **https://alihfph.github.io/pdf-rechnung-generator/**.

---

### If you use the backend later

The NestJS API (Redis, JWT) is not included in the free frontend hosts above. To run it for free you can use:

- **Railway** – https://railway.app (free tier; add Redis from their catalog).
- **Render** – https://render.com (free tier for web service; separate free Redis add-on).

Set `VITE_API_URL` in your frontend build to your backend URL (e.g. `https://your-app.railway.app`).
