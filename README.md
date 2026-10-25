# Browser Tetris

A playable desktop-keyboard Tetris game with a centered Canvas board, classic movement/rotation, line clears, score/levels, full-gravity-interval locking, pause and restart.

## Run

Use Node 22.12+ (verified on Node 24). Run `npm ci`, then `npm run dev`, and open the local URL. For a static build run `npm run build` and `npm run preview`. Downloaded release ZIPs must be served over HTTP(S), rather than opened as a file URL. See [USER-GUIDE](docs/USER-GUIDE.md) and [DEVELOPMENT](docs/DEVELOPMENT.md) for controls, checks and isolated browser setup.

## Project scope

The current classic baseline is the first bounded increment. Modern aids, penetrator gameplay, six configurable rules with cookie/URL persistence, session leaderboard and JSON/SQLite transfer are planned in the [seven-phase plan](docs/dev/PLAN.md). Current task state and verified evidence are in [TASKS](docs/dev/TASKS.md) and [HANDOFF](docs/dev/HANDOFF.md).

- [Project brief](docs/dev/PROJECT.md), [behavioral specification](docs/dev/SPEC.md) and [JSON Schema](docs/dev/spec/SAVE-SCHEMA.json)
- [Architecture](docs/dev/ARCHITECTURE.md), [components](docs/dev/DECOMPOSITION.md) and [layout](docs/dev/layout.md)

Development uses [SDD Manager](SDD-MANAGER.md). See the [AI-assisted development disclosure](AI_DISCLOSURE.md).
