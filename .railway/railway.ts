import { defineRailway, github, project, service, volume } from "railway/iac";

// This repository manages only its own resources, so applying it into an
// existing project never touches the other services there.
// See https://docs.railway.com/infrastructure-as-code#multi-repo-projects
export const partial = "claude-code-ssh";

export default defineRailway(() => {
  // EU West (Amsterdam). The service and its volume must share a region; pick
  // one near you before the first apply, since moving a volume is destructive.
  const region = "europe-west4-drams3a";

  // Name matches the volume created by the template, so existing deployments
  // keep their data instead of getting a new, empty volume.
  const data = volume("claude-code-mobile-volume", { region, sizeMB: 5000 });

  const claudeCodeSsh = service("claude-code-ssh", {
    // Deploying from a fork? Point this at your fork.
    source: github("Ntelikatos/claude-code-ssh", { branch: "master", checkSuites: true }),
    // Railway always builds with the root Dockerfile when one exists.
    build: {
      buildEnvironment: "V3",
      watchPatterns: [
        "Dockerfile",
        "sshd_config",
        "banner.txt",
        "tmux.conf",
        "scripts/**",
        "s6-overlay/**",
        "fail2ban/**",
      ],
    },
    // Restart policy type defaults to ON_FAILURE; only the retry limit differs.
    deploy: {
      restartPolicyMaxRetries: 5,
    },
    replicas: { [region]: 1 },
    tcp: [22],
    volumeMounts: {
      "/data": data,
    },
  });

  return project("claude-code-ssh", {
    // Secrets (SSH_PUBLIC_KEY, ANTHROPIC_API_KEY, GITHUB_TOKEN, ...) stay in
    // Railway variables and are never written to this file.
    variables: { managed: false },
    resources: [claudeCodeSsh, data],
  });
});
