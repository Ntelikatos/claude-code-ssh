# VPS & Local Docker Deployment

## Local Testing

```bash
# Build the image
docker build -t claude-code-ssh .

# Run the container
docker run -d \
  -e SSH_PUBLIC_KEY="$(cat ~/.ssh/id_ed25519.pub)" \
  -p 2222:22 \
  -v claude-data:/data \
  --name claude-ssh \
  claude-code-ssh

# Connect
ssh claude@localhost -p 2222 -i ~/.ssh/id_ed25519
```

## VPS Deployment (Hetzner, DigitalOcean, Oracle Cloud)

fail2ban's default `hostsdeny` ban action works on any host, with no extra capabilities:

```bash
docker run -d \
  -e SSH_PUBLIC_KEY="$(cat ~/.ssh/id_ed25519.pub)" \
  -p 22:22 \
  -v claude-data:/data \
  --name claude-ssh \
  claude-code-ssh
```

To ban at the kernel firewall instead, add `nftables` to the apt packages in the `Dockerfile`, set `banaction = nftables` in both jails of `fail2ban/jail.local`, rebuild, and add `--cap-add=NET_ADMIN` to `docker run`.

## Debugging

```bash
# Check container logs
docker logs -f claude-ssh

# Shell into the container
docker exec -it claude-ssh bash

# Check service status
docker exec claude-ssh /command/s6-rc -a list

# Check fail2ban status
docker exec claude-ssh bash -c 'fail2ban-client status sshd'
```
