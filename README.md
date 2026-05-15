# Habla

A self-hosted Spanish learning app for families. AI-powered conversation practice with a Mexican Spanish tutor named Sofía, using voice input and audio playback.

## What it does

- **AI conversation partner** — Talk with Sofía, a natural Mexican/Central American Spanish tutor powered by Claude
- **Voice input** — Speak into your mic; Whisper transcribes your speech in real time
- **Audio playback** — Sofía's responses are read aloud via OpenAI TTS or ElevenLabs
- **Family accounts** — Admin-managed user accounts, each with their own progress and history
- **Progress tracking** — Daily streaks, weekly practice minutes, recent topics
- **Mobile-friendly** — Bottom navigation bar on phones, sidebar on desktop; 44px+ touch targets throughout
- **Self-hosted** — Runs in Docker, served via Cloudflare tunnel

---

## API Setup

### Anthropic (Claude)

1. Create an account at [console.anthropic.com](https://console.anthropic.com)
2. Go to **Settings → Billing** and add a payment method — API access requires billing to be enabled
3. Go to **API Keys → Create Key**, copy it
4. No model permissions or special settings needed — `claude-sonnet-4-6` is available to all API users

### OpenAI (Whisper + TTS)

One OpenAI key covers both speech-to-text (Whisper) and text-to-speech (TTS).

1. Create an account at [platform.openai.com](https://platform.openai.com)
2. Go to **Settings → Billing** and add a payment method — both Whisper and TTS require billing to be enabled
3. Go to **API Keys → Create new secret key**, copy it
4. No special model access or org settings needed — `whisper-1` and `tts-1` are available to all accounts with billing

### ElevenLabs (optional — alternative TTS)

ElevenLabs offers more natural-sounding voices with stronger accent support. Switch to it from the **Admin → API Settings** page inside the app — no env vars needed.

**Step 1 — API Key:**
1. Create an account at [elevenlabs.io](https://elevenlabs.io)
2. Click your profile (top right) → **Profile Settings → API Keys**
3. Copy your API key — this is `ELEVENLABS_API_KEY`

**Step 2 — Pick a Voice:**
1. Go to **Voices** in the sidebar → **Voice Library**
2. Filter by **Language: Spanish** and **Gender: Female**
3. Search for voices tagged *Latin American*, *Mexican*, or *Neutral Spanish* for the most natural fit for Sofía
4. Click a voice you like → **Add to My Voices**
5. Go to **My Voices** → click the voice → copy the **Voice ID** shown under the name (looks like `EXAVITQu4vr4xnSDxMaL`) — this is `ELEVENLABS_VOICE_ID`

**Step 3 — Plan:**
The free tier gives 10,000 characters/month (~2 sessions). For regular family use, the **Creator plan ($22/month, 100,000 characters)** covers roughly 20 full sessions. See [elevenlabs.io/pricing](https://elevenlabs.io/pricing) for current plans.

The app is already configured to use `eleven_multilingual_v2` (best quality for Spanish) with sensible voice settings — no other ElevenLabs configuration is needed.

### Cloudflare tunnel

1. In [Cloudflare Zero Trust](https://one.dash.cloudflare.com), go to **Access → Tunnels**
2. Create a tunnel, copy the **tunnel token**
3. Under **Public Hostname**, add a route:
   - **Subdomain**: `habla` (or whatever you prefer)
   - **Domain**: your domain
   - **Service URL**: `http://habla:3000` — this routes through Docker's internal network; the app does not need to expose port 3000 to the host

---

## Cost reference

All costs are pay-as-you-go except ElevenLabs (plan-based).

**Per 20-minute session (~20 exchanges, voice input + audio playback):**

| Service | Cost |
|---------|------|
| Claude claude-sonnet-4-6 | ~$0.15 |
| OpenAI Whisper (STT) | ~$0.02 |
| OpenAI TTS | ~$0.08 |
| **Total (OpenAI stack)** | **~$0.25/session** |

**Monthly family estimate:**

| Usage | Sessions/month | Est. cost |
|-------|---------------|-----------|
| Light (1–2 sessions/week, family of 4) | ~30 | $7–9 |
| Moderate (daily short sessions) | ~60 | $15–18 |
| Heavy (multiple people, daily) | ~120 | $30–35 |

**ElevenLabs plan comparison (characters per session ~5,000):**

| Plan | Monthly cost | Characters | Sessions covered |
|------|-------------|------------|-----------------|
| Free | $0 | 10,000 | ~2 |
| Starter | $5 | 30,000 | ~6 |
| Creator | $22 | 100,000 | ~20 |
| Pro | $99 | 500,000 | ~100 |

---

## Portainer deployment

1. In Portainer → **Stacks → Add Stack → Repository**
2. Set your GitHub repo URL (`https://github.com/pghart/habla`), branch `main`, compose file `docker-compose.yml`
3. Enable **GitOps updates** and copy the webhook URL → add it to your GitHub repo under **Settings → Webhooks** (push events)
4. Add only these **environment variables** in Portainer — API keys are configured inside the app, not here:

```
NEXTAUTH_SECRET         # generate with: openssl rand -base64 32
NEXTAUTH_URL            # https://habla.yourdomain.com
CLOUDFLARE_TUNNEL_TOKEN
```

5. Click **Deploy the stack**

### First run

1. Navigate to your URL → redirected to `/setup` → create your admin account
2. Log in, then go to **Admin → API Settings** in the sidebar
3. Enter and test each API key through the UI — keys are encrypted before being saved to the database
4. Go to **Family** to add accounts for other family members

### API Settings page

The settings page (admin only) lets you configure and test all API connections without touching docker-compose or Portainer:

| Section | What you configure |
|---------|-------------------|
| **Anthropic** | API key + connection test |
| **OpenAI** | API key + connection test (covers Whisper STT and TTS) |
| **TTS Provider** | Toggle between OpenAI TTS and ElevenLabs |
| **ElevenLabs** | API key + connection test + voice sample playback |

Each key shows a masked preview of the stored value. The **Play sample** button for ElevenLabs voice actually generates and plays "Hola, me llamo Sofía." so you can audition the voice before committing to it.

Keys are encrypted with AES-256-GCM using your `NEXTAUTH_SECRET` as the key before being stored in the database.

---

## Updating

Push to GitHub → the Portainer webhook triggers an automatic rebuild and redeploy.

---

## Local development

```bash
cp .env.example .env.local
# For local dev, uncomment and fill in API keys in .env.local

npm install
npx prisma migrate dev --name init
npm run dev
```

Open http://localhost:3000 → `/setup` to create admin → then go to **Admin → API Settings** to enter keys through the UI (same as production), or uncomment them in `.env.local` for faster local iteration.

---

## Architecture

```
Browser
  ├── Mic → /api/transcribe → OpenAI Whisper → transcript
  ├── Text → /api/chat (SSE) → Claude claude-sonnet-4-6 → streaming response
  └── Response → /api/tts → OpenAI TTS (voice: nova) or ElevenLabs → audio playback

Data: SQLite via Prisma (Docker volume, persists across container restarts)
Auth: NextAuth.js credentials (bcrypt hashed passwords, JWT sessions)
Config: API keys stored AES-256-GCM encrypted in SQLite, managed via admin UI
Tunnel: cloudflared sidecar container → Cloudflare Zero Trust
Deploy: Portainer GitOps stack → auto-rebuild on GitHub push
```
