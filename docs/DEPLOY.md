# Deploying to Vercel

Target: **https://hivquiz.accioazra.com**, from the GitHub repo `DeemTheDev/hiz-quiz-taker` (branch `main`).

Do the steps in order. The whole thing takes about 15 minutes, most of which is waiting for DNS.

---

## 0. What each environment variable is for

| Variable | Value to use | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://hivquiz.accioazra.com` | No trailing slash. Used for share links (`/s/8?utm_source=share`) and Open Graph preview images. **Read at build time**, so changing it needs a fresh deploy. |
| `NEXT_PUBLIC_INSTAGRAM_URL` | `https://www.instagram.com/the_status.quo/` | "Follow us on Instagram" button. |
| `NEXT_PUBLIC_TIKTOK_URL` | `https://www.tiktok.com/@the_status_quo` | "Follow us on TikTok" button. |
| `ADMIN_PASSWORD` | *(your choice — see below)* | Protects `/admin` and the CSV export of every response. Changing it logs out all existing admin sessions. |
| `RATE_LIMIT_SALT` | *(long random string — see below)* | Secret used to hash visitor IPs for rate limiting. Never appears in the browser. |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | *(injected automatically)* | Added by the Upstash integration in step 2. Do not type these by hand. |

`NEXT_PUBLIC_*` variables are **compiled into the JavaScript bundle** and are visible to anyone who views source. That is fine for the three above (they are all public URLs). `ADMIN_PASSWORD` and `RATE_LIMIT_SALT` have no `NEXT_PUBLIC_` prefix, so they stay server-side only.

### What `RATE_LIMIT_SALT` actually does

The quiz limits one visitor to 20 submissions per hour, so nobody can sit there refreshing and skew the average. To count "per visitor" the server needs an identifier, and the obvious one is the IP address. But storing IP addresses next to HIV-quiz answers is exactly what this project promised not to do.

So instead of storing the IP, the server stores `sha256(ip + RATE_LIMIT_SALT)` as a Redis key with a one-hour expiry. The raw IP is never written anywhere.

The salt is what makes that hash safe. There are only about 4.3 billion IPv4 addresses, so an **unsalted** SHA-256 of an IP can be reversed by brute force in seconds. Anyone who obtained a dump of those Redis keys could recover the real IP addresses of people who took an HIV quiz. A long secret salt makes that impossible, because the attacker would need the salt too.

Use a fresh random value in production, different from the local dev one. Generate it with:

```bash
openssl rand -hex 32
```

Changing this value later is harmless — it just resets the rate-limit counters.

### About the admin password

`ADMIN_PASSWORD` is the only thing standing between the public internet and every response plus the CSV export. There is a login limiter (10 attempts per 15 minutes per client) but a short lowercase word is still guessable, and anything typed into a chat window should be treated as no longer secret.

Generate one instead:

```bash
openssl rand -base64 18
```

Store it in a password manager. If you change it later, everyone logged into `/admin` is signed out immediately.

---

## 1. Import the project into Vercel

1. Go to <https://vercel.com/new>.
2. Pick the `DeemTheDev/hiz-quiz-taker` repository. Authorise Vercel for the repo if prompted.
3. Vercel detects the settings automatically:
   - Framework preset: **Next.js**
   - Build command: `next build`
   - Install command: `pnpm install`
   - Output: `.next`

   Leave all of those alone.
4. **Do not click Deploy yet.** Expand **Environment Variables** and add the five from step 3 below first, so the first build already has them. (If you deploy first, that is fine too — just redeploy after adding them.)

---

## 2. Add the Upstash Redis database

The quiz works without a database — it simply hides the average and percentile. Add Redis to get the statistics and the admin dashboard.

1. In the Vercel project, open the **Storage** tab.
2. Choose **Marketplace → Upstash → Upstash for Redis** and click **Add**.
3. Accept the free plan (500 K commands per month; this quiz uses about 20 commands per completed attempt, so roughly 25 000 completions per month).
4. For **Region**, pick the one closest to your audience. For South Africa, **Frankfurt (`eu-central-1`)** is the closest common option.
5. Connect it to this project, for **all three environments** (Production, Preview, Development).

Vercel then injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` into the project automatically. The app reads either that pair or the `UPSTASH_REDIS_REST_*` pair, so nothing needs changing in code.

**Match the function region.** In **Settings → Functions**, set the region to Frankfurt (`fra1`) as well. If the database is in Frankfurt and the functions run in Washington, every stats write makes a round trip across the Atlantic. The quiz pages themselves are served from Vercel's global CDN either way, so this only affects the two API routes.

---

## 3. Set the environment variables

**Settings → Environment Variables.** Add each of these for **Production, Preview and Development** (tick all three boxes):

```
NEXT_PUBLIC_SITE_URL=https://hivquiz.accioazra.com
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/the_status.quo/
NEXT_PUBLIC_TIKTOK_URL=https://www.tiktok.com/@the_status_quo
ADMIN_PASSWORD=<your generated password>
RATE_LIMIT_SALT=<your generated 64-character hex string>
```

Set `NEXT_PUBLIC_SITE_URL` to the final subdomain now, even though the domain is not attached yet. That way you only need one build.

Optional extras, if you want them:

```
NEXT_PUBLIC_RESOURCES_URL=<link to local testing/PrEP services>   # adds "Find services near you" to the footer
NEXT_PUBLIC_ORG_NAME=<organisation name>                          # shows in the results footer; omit to stay neutral
```

---

## 4. Deploy

Click **Deploy**. The build takes roughly two minutes. When it finishes you get a `*.vercel.app` URL — open it and confirm the landing page loads and the quiz runs.

---

## 5. Attach the subdomain

1. In the Vercel project: **Settings → Domains → Add**.
2. Enter `hivquiz.accioazra.com` and confirm.
3. Vercel shows the DNS record to create. It will be a CNAME:

   | Type | Name | Value |
   | --- | --- | --- |
   | CNAME | `hivquiz` | `cname.vercel-dns.com` |

   Use whatever target Vercel displays rather than the one above if they differ.
4. Add that record at whoever hosts DNS for `accioazra.com` (your registrar or Cloudflare). If you use Cloudflare, set the proxy status to **DNS only** (grey cloud) — orange-cloud proxying in front of Vercel causes redirect loops.
5. Wait for propagation. Usually a few minutes, occasionally up to an hour. Vercel's Domains page shows a green tick and issues the TLS certificate automatically.

Check it from the terminal:

```bash
nslookup hivquiz.accioazra.com
```

---

## 6. Redeploy so share links use the real domain

`NEXT_PUBLIC_SITE_URL` is baked into the bundle at build time. If you set it in step 3 before the first build, you can skip this. Otherwise:

**Deployments → ⋯ on the latest → Redeploy**, and **untick "Use existing Build Cache"** so the new value is picked up.

---

## 7. Verify the live site

Work through this list on a real phone, not just a desktop browser:

- [ ] `https://hivquiz.accioazra.com` loads and the mascot animates.
- [ ] Answer one question wrong and one right; feedback and the fact card appear.
- [ ] Finish all ten; the results screen shows the score and tier.
- [ ] Both follow buttons open the correct profiles.
- [ ] Tap **Share result** and check the pasted text contains the `hivquiz.accioazra.com` link.
- [ ] Paste the link into WhatsApp and confirm the preview card renders.
- [ ] Open `https://hivquiz.accioazra.com/admin`, log in, and confirm the participant count went up.
- [ ] Click **Download CSV** and confirm the file has your attempt in it.
- [ ] Take the quiz five times so the average and percentile tiles switch on (they stay hidden below five participants).

Direct check of the API from a terminal:

```bash
curl -s https://hivquiz.accioazra.com/api/stats
```

Expect JSON with `"available": true`. If it says `"available": false, "reason": "not_configured"`, the Redis variables did not reach the deployment — recheck step 2 and redeploy.

---

## 8. Point the social bios at it

Once verified, the bio link is simply `https://hivquiz.accioazra.com`.

If you want to tell Instagram traffic apart from TikTok traffic in the future, the app does not track referrers by design (no analytics, no cookies). You would need to add an analytics tool, which would change the privacy statement shown to users — worth a deliberate decision rather than a quiet addition.

---

## Ongoing

- **Costs.** Vercel Hobby and the Upstash free tier cover this comfortably. Note that Vercel's Hobby plan is for non-commercial use — if this runs under a registered organisation, you may need a Pro plan.
- **Editing questions.** All quiz text lives in `src/data/questions.ts` and all other UI strings in `src/lib/copy.ts`. Push a commit to `main` and Vercel redeploys automatically.
- **Reading the data.** `/admin` shows totals, the score distribution, per-question correctness and the last 50 submissions. The CSV export holds up to 50 000 rows.
- **What is stored per attempt.** Score, the chosen option for each question, how long the attempt took, and a timestamp rounded down to the minute. Nothing else. No names, no IPs, no cookies for players.
