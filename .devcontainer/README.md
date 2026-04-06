# FinPulse DevContainer

This directory configures a VS Code DevContainer for FinPulse. It is intended for
**VS Code users only**. Regular terminal users should use `make start` from the project root,
which picks up `docker-compose.yml` at the root.

---

## How it works

When VS Code opens this project and you click **Reopen in Container**, it:

1. Builds the image from `.devcontainer/Dockerfile` (Node 20 Debian)
2. Starts the `app` service from `.devcontainer/docker-compose.yml` (container stays alive with `sleep infinity`)
3. Applies the overlay from `.devcontainer/docker-compose.devcontainer.yml` (removes host port bindings — VS Code handles port forwarding instead)
4. Runs `postCreateCommand`: `npm install && npx prisma generate && npx prisma db push`

After that, open the integrated terminal and start the dev server yourself:

```bash
make dev        # or: make start (same thing inside a container)
make db-seed    # seed demo data (first time only)
```

Open `http://localhost:3000` — VS Code forwards the port automatically.

---

## File reference

| File                               | Purpose                                                       |
|------------------------------------|---------------------------------------------------------------|
| `../Dockerfile`                    | Base image (project root): Node 20 Debian Bookworm            |
| `docker-compose.yml`               | DevContainer service definition (keep-alive container)        |
| `docker-compose.devcontainer.yml`  | Overlay that clears host port bindings for VS Code forwarding |
| `devcontainer.json`                | VS Code config: extensions, settings, postCreateCommand       |

---

## Environment variables

| Variable       | Value                                     |
|----------------|-------------------------------------------|
| `DATABASE_URL` | `file:/data/finpulse.db` (Docker volume)  |
| `AUTH_SECRET`  | `finpulse-dev-secret-change-in-production`|
| `AUTH_URL`     | `http://localhost:3000`                   |
| `NODE_ENV`     | `development`                             |

---

## Troubleshooting

### Port 3000 already in use

Another container may be running. Check with `docker ps` and stop it:

```bash
docker stop finpulse
```

### Database issues

The DB lives on the `finpulse-db` Docker volume and persists across container rebuilds.
To wipe it:

```bash
make db-reset   # inside the devcontainer terminal
```

### npm modules out of sync

The `node_modules` volume is cached for performance. After changing `package.json`:

```bash
make install    # inside the devcontainer terminal
```
