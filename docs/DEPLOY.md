# Deployment

The site runs on the cPanel host (LiteSpeed, PHP 8.4, MySQL, FTPS only, no SSH). GitHub Actions
builds everything and ships it as tarballs; a small PHP script on the server unpacks them.

## Layout on the server

```text
~/apps/portfolio/                 FTP path "portfolio/" (the shared deploy FTP account is rooted at ~/apps)
├── .env                          production config, chmod 600, never deployed
├── storage/                      logs, sessions, cache and admin uploads (storage/app/public), kept across deploys
├── _releases/                    uploaded tarballs + install status files
├── app/ bootstrap/ config/ …     Laravel code, replaced by "app" releases
└── public/                       the document root
    ├── index.html, projects/ …   static site, replaced by "site" releases (listed in .site-files)
    ├── index.php, css/, js/ …    Laravel front controller + Filament assets (listed in .app-files)
    ├── uploads → ../storage/app/public
    ├── .htaccess                 generated per build (routing, 404s, redirects, caching, security headers)
    └── _unpack.php               release installer (token-guarded)
```

Staging: `staging.harshchaudhary.com.np` with document root `apps/portfolio/public`, served with
`noindex`. At launch the main domain points at the same `public/` (see "Launch").

## How deploys happen

| Trigger | What runs |
|---|---|
| Push to `main` touching `backend/` or `deploy/` | tests → **app** release → migrate/seed/cache → **site** release |
| Push to `main` touching only `frontend/` | checks + Lighthouse → **site** release |
| Saving anything in the admin panel | `repository_dispatch: content-updated` → **site** release (~2–3 min) |
| Daily 06:00 NPT | GitHub stats sync → **site** release |
| Actions → CI / Deploy → Run workflow | **site** release (tick "Deploy the backend too" for **app** as well) |

The site build reads all content from `SITE_URL/api/v1/content`, then `scripts/postbuild.ts` writes
social cards, sitemap, feeds, robots.txt and `.htaccess`. After a production deploy, pages that are
new or changed are sent to IndexNow.

## One-time setup

1. **cPanel UI** (the API is behind an Imunify360 bot challenge for scripts, including GitHub's runners):
   - *Domains → Create A New Domain*: `staging.harshchaudhary.com.np`, untick "Share document root",
     document root `apps/portfolio/public`.
   - *MultiPHP Manager*: tick `staging.harshchaudhary.com.np` → PHP 8.4 (`ea-php84`) → Apply.
   - *Manage My Databases*: create database `portfolio` (→ `harshchaudhary_portfolio`), user `portfolio`
     (→ `harshchaudhary_portfolio`) with the password in `~/.ssh/portfolio_db_password.txt`, then add the
     user to the database with **All Privileges**.
   - *SSL/TLS Status*: tick the staging domain → Run AutoSSL.
2. **Server `.env`**: run **Actions → Provision server (one-off)** (defaults). It writes
   `~/apps/portfolio/.env` (chmod 600) over FTPS from the repository secrets. Its contents:

   ```dotenv
   APP_NAME="Harsh Chaudhary"
   APP_ENV=production
   APP_KEY=base64:…            # php artisan key:generate --show
   APP_DEBUG=false
   APP_URL=https://staging.harshchaudhary.com.np
   DB_CONNECTION=mysql
   DB_HOST=localhost
   DB_DATABASE=harshchaudhary_portfolio
   DB_USERNAME=harshchaudhary_portfolio
   DB_PASSWORD=…
   SESSION_DRIVER=database
   SESSION_SECURE_COOKIE=true
   CACHE_STORE=database
   QUEUE_CONNECTION=sync
   MAIL_MAILER=sendmail
   MAIL_FROM_ADDRESS=noreply@harshchaudhary.com.np
   MAIL_FROM_NAME="Harsh Chaudhary"
   ADMIN_NAME="Harsh Chaudhary"
   ADMIN_EMAIL=…
   ADMIN_PASSWORD=…            # first login only; change it and set up 2FA in the admin
   OPS_TOKEN=…                 # same value as the GitHub secret
   GITHUB_TOKEN=…              # fine-grained, public read-only
   GITHUB_USERNAME=theharshchaudhary
   SITE_BUILD_REPO=theharshchaudhary/portfolio
   SITE_BUILD_TOKEN=…          # fine-grained, this repo: Contents read & write
   ```

3. **GitHub → Settings → Secrets and variables → Actions**
   - Secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` (the shared deploy account), `OPS_TOKEN`
   - Variables: `SITE_URL` (`https://staging.harshchaudhary.com.np`), `SITE_ENV` (`staging`), `FTP_DIR` (`portfolio`)

   Deploy jobs are skipped until `SITE_URL` is set.
4. Run **Actions → CI / Deploy → Run workflow** with "Deploy the backend too" ticked.

### Tokens

- **GITHUB_TOKEN** (GitHub stats): github.com → Settings → Developer settings → Fine-grained tokens →
  Generate. Repository access: *Public repositories (read-only)*. No permissions needed.
- **SITE_BUILD_TOKEN** (rebuild after admin edits): same page, *Only select repositories* →
  `portfolio`, Repository permissions → **Contents: Read and write**. (`repository_dispatch` needs it.)

Set an expiry you'll remember; the admin dashboard shows "Last site build: failed" when a token expires.

## Launch (staging → harshchaudhary.com.np)

1. In the admin: Site settings → General → Site URL `https://harshchaudhary.com.np`; set the IndexNow key.
2. `.env`: `APP_URL=https://harshchaudhary.com.np`.
3. Delete the old CMS template from `public_html` (no backup needed) and point the main domain at
   `apps/portfolio/public` (replace `public_html` with a symlink to it).
4. GitHub variables: `SITE_URL=https://harshchaudhary.com.np`, `SITE_ENV=production`; run the workflow.
5. Google Search Console + Bing Webmaster Tools: verify the domain, submit `/sitemap.xml`.
6. Remove the staging subdomain (or leave it: it's `noindex`).

## Troubleshooting

- **Release install failed**: CI prints the unpacker's status JSON with the reason. The previous
  release keeps serving because a failed install rolls back.
- **Post-deploy task failed**: `curl -H "Authorization: Bearer $OPS_TOKEN" $SITE_URL/api/ops/runs/<run>`
  shows each step's result; Laravel logs are in `storage/logs/`.
- **cPanel API returns "One moment, please…"**: Imunify360 is challenging this IP. Log in to cPanel
  once in a browser from the same network to clear it.
