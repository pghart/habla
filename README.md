# Habla

A self-hosted Spanish learning app for families. AI-powered conversation practice with a Mexican Spanish tutor named Sofía, using voice input and audio playback.

## What it does

- **AI conversation partner** — Talk with Sofía, a natural Mexican/Central American Spanish tutor powered by Claude
- **Voice input** — Speak into your mic; Whisper transcribes your speech in real time
- **Audio playback** — Sofía's responses are read aloud via OpenAI TTS
- **Family accounts** — Admin-managed user accounts, each with their own progress and history
- **Progress tracking** — Daily streaks, weekly practice minutes, recent topics
- **Self-hosted** — Runs in Docker, served via Cloudflare tunnel

---

## Setup

### 1. API Keys you need

| Key | Where to get it |
|-----|----------------|
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `OPENAI_API_KEY` | platform.openai.com (used for Whisper STT + TTS) |
| `CLOUDFLARE_TUNNEL_TOKEN` | Cloudflare Zero Trust → Tunnels → your tunnel → token |

### 2. Cloudflare tunnel setup

1. In [Cloudflare Zero Trust](https://one.dash.cloudflare.com), go to **Access → Tunnels**
2. Create a tunnel, copy the tunnel token
3. Under **Public Hostname**, add a route:
   - **Subdomain**: `habla` (or whatever you want)
   - **Domain**: your domain
   - **Service URL**: `http://habla:3000`  ← uses Docker internal network

### 3. Portainer deployment

1. In Portainer → **Stacks → Add Stack → Repository**
2. Set your GitHub repo URL, branch `main`, compose file `docker-compose.yml`
3. Enable **GitOps updates** and add the webhook to your GitHub repo (Settings → Webhooks)
4. Add these **environment variables** in Portainer (do not commit real values to GitHub):

```
NEXTAUTH_SECRET      # openssl rand -base64 32
NEXTAUTH_URL         # https://habla.yourdomain.com
ANTHROPIC_API_KEY    # sk-ant-...
OPENAI_API_KEY       # sk-...
CLOUDFLARE_TUNNEL_TOKEN
TTS_PROVIDER         # openai (or elevenlabs)
```

5. Click **Deploy the stack**

### 4. First run

Navigate to `https://habla.yourdomain.com` → you'll be redirected to `/setup` to create your admin account.

Then go to **Family** (sidebar) to add accounts for other family members.

---

## Local development

```bash
cp .env.example .env.local
# Fill in your API keys

npm install
npx prisma migrate dev --name init
npm run dev
```

Open http://localhost:3000 — on first visit you'll be sent to `/setup`.

---

## Updating

Push to GitHub → Portainer webhook triggers an automatic rebuild and redeploy.

---

## Architecture

```
Browser
  ├── Mic → /api/transcribe → OpenAI Whisper → transcript
  ├── Text → /api/chat (SSE) → Claude claude-sonnet-4-6 → streaming response
  └── Response → /api/tts → OpenAI TTS (voice: nova) → audio playback

Data: SQLite via Prisma (Docker volume)
Auth: NextAuth.js credentials (bcrypt hashed passwords)
Tunnel: cloudflared sidecar container → Cloudflare Zero Trust
```
