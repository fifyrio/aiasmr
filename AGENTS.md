# Repository Guidelines

## Project Structure & Module Organization
The Next.js 14 client lives in `src/`. Routes stay in `src/app`, shareable UI sits in `src/components`, contexts/hooks/config live under their respective folders, and translations live in `src/i18n`. Utilities, services, and styles reside in `src/lib`, `src/utils`, `src/services`, and `src/styles`. Assets ship from `public/` and `sample_videos/`. Audio automation scripts live in `scripts/`, while Supabase DDL and templates live in `database/`. The `backend-api/` directory is a standalone Node service that proxies video/audio generation to external providers—bootstrap it separately when editing server code.

## Build, Test, and Development Commands
Install dependencies with `npm install` (repeat inside `backend-api/` if needed). Key commands:
- `npm run dev` – run the Next dev server.
- `npm run build && npm run start` – produce and serve the production bundle.
- `npm run lint` – apply the repo’s ESLint + Next rules.
- `npm run test:veo2` – execute `scripts/test-veo2.js` to validate the Google VEO integration.
- `npm run audio:process|convert|upload|urls` – orchestrate the audio pipeline housed in `scripts/audio-pipeline/`.
Backend testing uses `node test-video-generation.js`, and `node server.js` runs the proxy API locally.

## Coding Style & Naming Conventions
Use TypeScript, React function components, and Tailwind-first styling. Honor ESLint defaults: 2-space indentation, single quotes outside JSX, no implicit `any`, and prefer early returns. Components/hooks use PascalCase (`FocusWave.tsx`, `useAudioState.ts`); helpers/constants are camelCase; env vars remain SCREAMING_SNAKE_CASE. Keep locale keys consistent with route segments (e.g., `src/i18n/en/music.json`), and colocate feature-specific assets beside the owning component.

## Testing Guidelines
Automated UI tests are opt-in, so add co-located `*.spec.tsx` files whenever logic branches or async workflows are introduced. Always run `npm run test:veo2` after touching generation logic or scripts, and mirror that in `backend-api/test-video-generation.js` when the proxy changes. Document manual verification steps in PR descriptions and ensure new scripts exit non-zero on failure to keep future CI reliable.

## Commit & Pull Request Guidelines
Recent history uses Conventional Commit verbs (`feat:`, `fix:`, `chore:`); keep that format and scope each commit to one concern. PRs should explain the user impact, list major code paths touched, link issues, and add screenshots for UI updates. Mention new environment variables, migrations, or asset uploads. Do not request review until `npm run lint` and relevant tests pass locally, and call out follow-up tasks if you intentionally defer work.
