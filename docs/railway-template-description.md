# Deploy and Host Claude Code SSH with Railway

Claude Code SSH puts Anthropic's Claude Code CLI on an always-on Railway service you can reach over SSH from your phone, tablet, or laptop. Sessions survive dropped connections, and your projects, login, and keys live on a persistent volume. Hardened, post-quantum SSH is on by default.

## About Hosting Claude Code SSH

Claude Code needs a terminal. That's easy at your desk and awkward everywhere else. Claude Code SSH packages Claude Code into a hardened container that you SSH into from any device. Your tmux sessions keep running through WiFi switches, app closures, and Railway redeploys, so you can reconnect and pick up where you left off. The template already creates the TCP proxy on port 22 and a volume at `/data`. Paste your SSH public key into `SSH_PUBLIC_KEY`, connect with the host and port Railway shows, and run `claude`. Prefer infrastructure as code? The repository describes the same setup in a Railway IaC file, `.railway/railway.ts`.

## Common Use Cases

- **Code from your phone** — Use Claude Code from Termius, Blink Shell, or JuiceSSH with a mobile-tuned terminal. Lock your phone, come back later, and your session is still there.
- **Long-running agent sessions** — Start a task in tmux, detach, and check on it from another device.
- **AI pair programming from anywhere** — No local install. Works with your Claude subscription or a Claude Console API key.
- **Secure remote development** — Clone private repos with a scoped GitHub token, build full-stack projects, and open PRs from an isolated service.

## Dependencies for Claude Code SSH Hosting

- **Claude Code authentication** — A Claude Pro, Max, Ultra, Team, or Enterprise subscription (`claude auth login`), or a Claude Console API key
- **SSH key pair** — An Ed25519 key (generate one in Termius on mobile or with `ssh-keygen` on desktop)

### Deployment Dependencies

- [Claude Code](https://code.claude.com/docs) — Anthropic's agentic coding tool
- [Railway TCP Proxy](https://docs.railway.com/networking/tcp-proxy) — Public SSH access on port 22
- [Railway Volumes](https://docs.railway.com/volumes) — Persistent storage for projects, auth, and host keys
- [Railway Infrastructure as Code](https://docs.railway.com/infrastructure-as-code) — The deployment, defined in `.railway/railway.ts`
- [Source code on GitHub](https://github.com/Ntelikatos/claude-code-ssh)

### Implementation Details

Find HOST and PORT under **Settings > Networking > TCP Proxy**, then connect and start coding:

```bash
ssh claude@HOST -p PORT -i ~/.ssh/id_ed25519
tmux new -s dev
claude
```

**What's included out of the box:**

- **Railway Infrastructure as Code** — Service, Dockerfile build, TCP proxy, and volume declared in `.railway/railway.ts`. Preview with `railway config plan`, roll out with `railway config apply`. Secrets stay in Railway variables.
- **Post-quantum SSH** — ML-KEM-768 + X25519 hybrid key exchange (OpenSSH 10), key-only auth, AEAD ciphers, zero ssh-audit failures
- **Key-only access** — No passwords to brute-force. Self-hosting on a VPS? fail2ban and OpenSSH per-source penalties ban attackers too
- **Persistent tmux** — Mobile-tuned config with touch scrolling, true color, and 50k lines of scrollback
- **Node.js 26 LTS + pnpm 12** — On Debian 13, with optional version overrides through Railway variables
- **GitHub CLI** — Clone private repos with fine-grained tokens set as Railway variables
- **Multi-device access** — Add an SSH key for every device you own
- **Self-updating Claude Code** — Installed with Anthropic's native installer, which auto-updates in the background

### Why Deploy Claude Code SSH on Railway?

Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it.

By deploying Claude Code SSH on Railway, you are one step closer to supporting a complete full-stack application with minimal burden. Host your servers, databases, AI agents, and more on Railway.

---

<sub>This is a community project and is not affiliated with, endorsed by, or officially supported by Anthropic. Claude Code is a product of Anthropic. All trademarks belong to their respective owners.</sub>
