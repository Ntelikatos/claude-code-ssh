# Claude Code SSH

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/claude-code-mobile?referralCode=fhlcDU&utm_medium=integration&utm_source=template&utm_campaign=generic)

[![Docker Build](https://github.com/Ntelikatos/claude-code-ssh/actions/workflows/docker-build.yml/badge.svg)](https://github.com/Ntelikatos/claude-code-ssh/actions/workflows/docker-build.yml)
[![Lint Dockerfile](https://github.com/Ntelikatos/claude-code-ssh/actions/workflows/lint-dockerfile.yml/badge.svg)](https://github.com/Ntelikatos/claude-code-ssh/actions/workflows/lint-dockerfile.yml)
[![ShellCheck](https://github.com/Ntelikatos/claude-code-ssh/actions/workflows/shellcheck.yml/badge.svg)](https://github.com/Ntelikatos/claude-code-ssh/actions/workflows/shellcheck.yml)
[![Trivy Security Scan](https://github.com/Ntelikatos/claude-code-ssh/actions/workflows/trivy.yml/badge.svg)](https://github.com/Ntelikatos/claude-code-ssh/actions/workflows/trivy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Run Claude Code from anywhere via SSH. Deploy on Railway and code from your phone in under 5 minutes.

## What You Get

- **Claude Code CLI** ready to use over SSH from any device
- **Persistent sessions** — tmux is pre-configured for mobile. Switch WiFi, close the app, come back later. Your session is still there.
- **Hardened SSH** — key-only auth, post-quantum key exchange (ML-KEM + X25519), modern ciphers, zero ssh-audit failures. No passwords, no weak algorithms.
- **Brute-force protection** — key-only auth everywhere; on a VPS or direct Docker, fail2ban and OpenSSH per-source penalties also ban attackers (1 hour after 3 failures, 1 week for repeat offenders)
- **Mobile-optimized tmux** — pre-tuned for Termius, Blink, and JuiceSSH. No broken characters, no escape sequence leaks.
- **Node.js 26 LTS + pnpm 12** — ready for full-stack development. Override versions with `NODE_VERSION` and `PNPM_VERSION` env vars.
- **GitHub integration** — clone private repos with a fine-grained PAT scoped to specific repos only
- **Persistent storage** — your projects, auth, and config survive redeployments via Railway volumes
- **Multi-device access** — add SSH keys from your laptop, phone, and tablet. Connect from anywhere.
- **Railway Infrastructure as Code** — the whole deployment (service, Dockerfile build, TCP proxy, volume, restart policy) is declared in [`.railway/railway.ts`](.railway/railway.ts). Review it with `railway config plan`, roll it out with `railway config apply`.

---

## Deploy to Railway

### Step 1: Deploy the Template

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/claude-code-mobile?referralCode=fhlcDU&utm_medium=integration&utm_source=template&utm_campaign=generic)

The template already sets up the TCP proxy on port `22` and a persistent volume at `/data`.

Prefer to manage the project from code? See [Deploy with Infrastructure as Code](#deploy-with-infrastructure-as-code).

### Step 2: Set Your SSH Public Key

In Railway dashboard, go to your service **Variables** and add:

| Variable         | Value                                         |
| ---------------- | --------------------------------------------- |
| `SSH_PUBLIC_KEY` | Your public key (see below for how to get it) |

**From desktop** — copy your existing key:

```bash
cat ~/.ssh/id_ed25519.pub
```

**From mobile (Termius)** — generate a new key:

1. Open Termius > **Keychain** > **Keys** > **+** > **Generate**
2. Select **Ed25519**, give it a name, save
3. Tap the key > **Export public key** > copy the text

**Using multiple devices?** Paste all public keys into `SSH_PUBLIC_KEY`, one per line:

```
ssh-ed25519 AAAA...laptop-key... you@laptop
ssh-ed25519 AAAA...phone-key... mobile
```

### Step 3: Find Your SSH Address

Go to your service **Settings** > **Networking** > **TCP Proxy**. Railway shows the public address for port `22`, e.g. `shuttle.proxy.rlwy.net:15140`.

Save it — you need the host and port to connect.

### Step 4: Connect

```bash
ssh claude@shuttle.proxy.rlwy.net -p 15140 -i ~/.ssh/id_ed25519
```

Replace the host and port with your values from Step 3.

### Step 5: Authenticate Claude Code

Choose one method:

**Option A: Claude subscription (Pro, Max, Ultra, Team, or Enterprise)** — recommended

```bash
claude auth login
```

Open the URL it prints in any browser, sign in with your Claude account, and paste the code back into the terminal if asked. No API key needed.

**Option B: API key from the Claude Console**

Add `ANTHROPIC_API_KEY` in Railway Variables (triggers redeploy), or set it manually:

```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
echo 'export ANTHROPIC_API_KEY=sk-ant-your-key-here' >> ~/.bashrc
```

Auth persists across restarts via the `/data` volume.

### Step 6: Start Coding

```bash
tmux new -s dev
claude
```

Detach anytime with `Ctrl+B` then `D`. Reattach later with `tmux attach -t dev`.

### Step 7: Clone Your Repos (optional)

Use a fine-grained Personal Access Token to grant access to **specific repos only**.

1. Go to [GitHub > Settings > Developer settings > Personal access tokens > Fine-grained tokens](https://github.com/settings/personal-access-tokens/new)
2. Set **Resource owner** to your account or org
3. Set **Repository access** to **Only select repositories** and pick the repos you need
4. Under **Permissions > Repository permissions**, grant:
   - **Contents**: Read and write (clone, push, branches)
   - **Pull requests**: Read and write (create/merge PRs)
   - **Issues**: Read and write (create/comment on issues)
5. Generate and copy the token
6. In Railway dashboard, add it as a variable:

| Variable       | Value                |
| -------------- | -------------------- |
| `GITHUB_TOKEN` | `github_pat_xxxx...` |

After redeploy, just clone:

```bash
cd /workspace
git clone https://github.com/you/your-private-repo
claude
```

Auth persists across restarts via the `/data` volume.

**Need repos from multiple orgs?** Create a separate Railway service per org, each with its own scoped `GITHUB_TOKEN`. This keeps access isolated — one container never touches another org's repos.

> **Alternative:** `gh auth login` is also available but grants access to **all** repos across all your orgs. Use it only if you're comfortable with that scope.

---

## Deploy with Infrastructure as Code

The Railway project is defined in [`.railway/railway.ts`](.railway/railway.ts) using [Railway Infrastructure as Code](https://docs.railway.com/infrastructure-as-code): one `claude-code-ssh` service built from the `Dockerfile`, a TCP proxy on port `22`, a volume mounted at `/data`, and the restart policy. Secrets are never stored in the file: the project sets `variables: { managed: false }`, so your Railway variables stay untouched.

Requires the [Railway CLI](https://docs.railway.com/cli) (`railway upgrade` for the latest) and Node.js 22+.

1. Fork this repo, clone your fork, and install the IaC SDK:

   ```bash
   git clone https://github.com/<you>/claude-code-ssh
   cd claude-code-ssh
   npm install
   ```

2. In `.railway/railway.ts`, point `github(...)` at your fork and pick a `region` near you.

3. Create a project (or `railway link` an existing one), then preview and apply:

   ```bash
   railway login
   railway init --name claude-code-ssh
   railway config plan
   railway config apply
   ```

4. Add your SSH key, then continue from [Step 3](#step-3-find-your-ssh-address):

   ```bash
   railway variable set SSH_PUBLIC_KEY --stdin --service claude-code-ssh < ~/.ssh/id_ed25519.pub
   ```

The file exports `partial = "claude-code-ssh"`, so applying it into a project that already has other services only manages this service and its volume.

### Moving an existing deployment off `railway.json`

Railway's old Config as Code (`railway.json` / `railway.toml`) is [deprecated](https://docs.railway.com/config-as-code), and those files stop being read on **2026-12-01**. This repo no longer ships `railway.json`. If your service was created while it did, switch it to IaC once:

```bash
railway link                    # pick the project and environment
railway config migrate cutover  # stop reading railway.json (undo: railway config migrate undo)
railway config plan             # review: should only list the settings now owned by IaC
railway config apply
```

Keep the volume name in `.railway/railway.ts` (`claude-code-mobile-volume`, the name the template uses) and its `region`/`sizeMB` matching your live volume. Changing any of them replaces the volume, and the plan marks that as destructive.

---

## Mobile Setup

### Termius (iOS / Android)

1. **Generate a key** (if you don't have one): **Keychain** > **Keys** > **+** > **Generate** > **Ed25519**
2. **Copy the public key**: tap the key > **Export public key** > copy text
3. **Add it to Railway**: paste into `SSH_PUBLIC_KEY` variable (alongside your desktop key if needed)
4. **Create a host**: **Hosts** > **+**
   - **Hostname**: your Railway TCP domain (e.g. `shuttle.proxy.rlwy.net`)
   - **Port**: your assigned port (e.g. `15140`)
   - **Username**: `claude`
   - **Key**: select your generated key
5. **Enable keep-alive**: host settings > advanced > **Keep connection alive**
6. Connect and run `tmux new -s dev && claude`

### Blink Shell (iOS)

1. Import your Ed25519 private key in Blink's key management
2. Configure the host:
   ```
   ssh claude@shuttle.proxy.rlwy.net -p 15140
   ```

### JuiceSSH (Android)

1. **Identities** > add new > import your Ed25519 private key
2. **Connections** > add new > set host, port, username `claude`
3. Select your identity, enable keep-alive

---

## Persistent Sessions

Your SSH connection will drop — WiFi switches, cellular handoffs, locking your phone. That's fine. tmux keeps your session alive on the server.

```bash
# Create a session
tmux new -s dev

# Detach (session keeps running): Ctrl+B, then D

# Reattach after reconnecting
tmux attach -t dev

# List all sessions
tmux ls
```

**One-liner** — auto-attach on connect (save this in your SSH client):

```bash
ssh claude@<host> -p <port> -i ~/.ssh/id_ed25519 -t "tmux attach -t dev || tmux new -s dev"
```

The included tmux config is tuned for mobile: true-color support, mouse/touch scrolling, low escape-time for mobile latency, and 50k line scrollback.

> Railway's [Serverless](https://docs.railway.com/deployments/serverless) (app sleeping) stops idle containers, which ends tmux sessions. Leave it off if you rely on detached sessions.

---

## Environment Variables

| Variable            | Required | Default   | Description                                                                |
| ------------------- | -------- | --------- | -------------------------------------------------------------------------- |
| `SSH_PUBLIC_KEY`    | Yes      | —         | Ed25519 public key(s) for SSH auth. Multiple keys supported, one per line. |
| `ANTHROPIC_API_KEY` | No       | —         | Claude Console API key. Alternative to `claude auth login`.                |
| `GITHUB_TOKEN`      | No       | —         | Fine-grained PAT for cloning private repos. Scoped to specific repos only. |
| `NODE_VERSION`      | No       | `26`      | Node.js version (e.g. `24`, `22.22.0`). Uses `n` to switch at boot.        |
| `PNPM_VERSION`      | No       | `12.16.1` | pnpm version (e.g. `11`, `10.34.9`). Installed with npm at boot.           |
| `TZ`                | No       | `UTC`     | Timezone (e.g. `America/New_York`, `Europe/London`)                        |

---

## Security

- **Key-only authentication** — passwords completely disabled
- **Post-quantum key exchange** — ML-KEM-768 + X25519 and sntrup761 + X25519 hybrids (OpenSSH 10), Curve25519 and DH Group 16/18 for older clients
- **Modern ciphers** — ChaCha20-Poly1305, AES-256-GCM (AEAD only)
- **ETM-only MACs** — HMAC-SHA2-512-ETM, HMAC-SHA2-256-ETM
- **fail2ban** — 3 failed attempts = 1 hour ban, repeat offenders = 1 week ban
- **OpenSSH per-source penalties** — sshd also throttles addresses that keep failing to authenticate
- **Proxy-aware bans** — behind Railway's TCP proxy every client shares Railway-internal addresses, so those are exempt from bans and penalties (otherwise one scanner would lock everyone out). On Railway, key-only auth is the protection; on a VPS or direct Docker, bans apply to real client IPs.
- **Non-root user** — all operations run as unprivileged `claude` user
- **DH moduli filtered** — only >= 3071-bit entries
- **Zero [ssh-audit](https://github.com/jtesta/ssh-audit) failures** — the only warnings are the classic Curve25519/DH fallbacks, kept for older mobile clients

---

## Troubleshooting

**Host key warning after redeploy**: Remove the old key:

```bash
ssh-keygen -R "[your-host]:port"
```

**Connection refused**: Check that the TCP Proxy for port 22 exists in **Settings** > **Networking** (the template and `.railway/railway.ts` both create it).

**Permission denied (publickey)**: Verify `SSH_PUBLIC_KEY` contains your public key. On mobile, re-export from Termius and update the Railway variable.

**Claude Code not authenticated**: Run `claude auth login` inside the container (check with `claude auth status`), or set `ANTHROPIC_API_KEY`.

**tmux session lost**: Sessions persist while the container runs. If the container restarted, start a new session. Your files on `/data` are safe.

**`railway config plan` says the service is managed by `/railway.json`**: Run `railway config migrate cutover` first. See [Moving an existing deployment off `railway.json`](#moving-an-existing-deployment-off-railwayjson).

---

## Cost

| Platform          | Cost      | Notes                             |
| ----------------- | --------- | --------------------------------- |
| Railway Hobby     | ~$5-10/mo | Pay-as-you-go, TCP proxy included |
| Any Docker VPS    | ~$5+/mo   | Hetzner, DigitalOcean, etc.       |
| Oracle Cloud Free | $0        | ARM A1, always-free tier          |

See [docs/vps-deployment.md](docs/vps-deployment.md) for VPS and local Docker deployment instructions.

---

## License

MIT
