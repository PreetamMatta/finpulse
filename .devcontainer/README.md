# FinPulse Dev Container Setup

This devcontainer provides a development environment for FinPulse with two workflow options:

## Option 1: Terminal-Based Development (Recommended)

**Best for**: Interactive development, debugging, and running commands directly.

### Setup

1. Open the project in VS Code with devcontainers
2. VS Code will automatically build and start the `app` service
3. Inside the terminal, run:

```bash
make start
```

This starts the Next.js dev server on `http://localhost:3000` and gives you full control over the process.

### Benefits

- Same experience as local development (`make start`)
- You can stop/restart the dev server easily (Ctrl+C)
- Full terminal access for debugging and running commands
- Port 3000 is only bound when you're actively running the server

---

## Option 2: Docker Compose-Based Development

**Best for**: Full containerization, testing deployment scenarios, or running multiple services.

### Setup

From your **local machine** (not inside the devcontainer terminal):

```bash
# Start devcontainer + app server in separate containers
docker compose -f .devcontainer/docker-compose.yml up -d app app-server

# View logs
docker compose -f .devcontainer/docker-compose.yml logs -f app-server

# Stop
docker compose -f .devcontainer/docker-compose.yml down
```

The app-server will run on `http://localhost:3001` (separate port to avoid conflicts).

### Benefits

- True containerized workflow
- App server runs independently
- Easy to restart just the server without recreating the devcontainer

---

## File Structure

- **`docker-compose.yml`**: Defines `app` (devcontainer) and `app-server` (optional) services
- **`docker-compose.devcontainer.yml`**: Overlay that removes port bindings for devcontainer (handled by VS Code forwarding)
- **`Dockerfile`**: Base image (Node 20 + dev tools)
- **`devcontainer.json`**: VS Code devcontainer configuration

---

## Environment Variables

Both services use:

- `DATABASE_URL`: `file:/data/finpulse.db` (SQLite on Docker volume)
- `AUTH_SECRET`: `finpulse-dev-secret-change-in-production`
- `AUTH_URL`: `http://localhost:3000` (for `app`) or `http://localhost:3001` (for `app-server`)
- `NODE_ENV`: `development`

---

## Troubleshooting

### "Port 3000 already in use"

If you see this error:

1. Make sure you don't have multiple instances of the dev server running
2. Check: `docker ps` to see running containers
3. Kill stale containers: `docker container rm finpulse-dev finpulse-app-server 2>/dev/null`

### "Can't connect to database"

Both services share the `finpulse-db` volume, so data persists. If the DB is corrupted:

```bash
docker volume rm finpulse-db
```

Then restart — Prisma will re-initialize.

### "npm modules not syncing"

The `node_modules` volume is cached for performance. If you update `package.json`:

```bash
make install  # or npm install inside terminal
```
