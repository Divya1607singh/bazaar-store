# Bazaar

Storefront (`index.html`) and admin dashboard (`dashboard.html`).

- Local: `npm test` then open `dist/index.html`, or `docker compose up --build` -> http://localhost:8080
- CI/CD: `.github/workflows/ci-cd.yml` (check -> build -> Docker -> push to GHCR -> deploy to EC2)
- Server setup: `deploy/setup-ec2.sh` (once). Secrets needed: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`
