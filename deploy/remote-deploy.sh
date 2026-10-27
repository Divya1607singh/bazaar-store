#!/usr/bin/env bash
# Runs ON the EC2 server (sent over SSH by the pipeline). Expects: IMAGE, GH_USER, GH_TOKEN.
set -euo pipefail
NAME=bazaar

echo "$GH_TOKEN" | docker login ghcr.io -u "$GH_USER" --password-stdin
docker pull "$IMAGE"

PREV=$(docker inspect --format '{{.Config.Image}}' "$NAME" 2>/dev/null || true)
docker rm -f "$NAME" 2>/dev/null || true
docker run -d --name "$NAME" --restart unless-stopped -p 80:80 "$IMAGE"

for i in $(seq 1 15); do
  if curl -fsS http://localhost/healthz >/dev/null; then
    echo "Deployed $IMAGE and healthy"
    docker image prune -f >/dev/null
    docker logout ghcr.io
    exit 0
  fi
  sleep 2
done

echo "Health check failed. Rolling back." >&2
docker logs --tail 20 "$NAME" >&2 || true
docker rm -f "$NAME"
[ -n "$PREV" ] && docker run -d --name "$NAME" --restart unless-stopped -p 80:80 "$PREV"
docker logout ghcr.io
exit 1
