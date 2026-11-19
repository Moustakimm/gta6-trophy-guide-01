// Leonida Trophy Guide — the entrypoint for gta6-trophy-guide-01 (Node 22, stdlib only).
// I wrote this file in the recorded build session. It hands the guide in: it copies
// this repository's app/ (the offline guide: index.html, app.js, style.css and
// data/trophies.json with the official 55-trophy list and our own guides) and
// screenshots/ (3 or 4 real renders of the guide) into the output directory, then
// writes output/dossier.json with the kit's vendored buildDossier from
// vendor/makefun-frontend.ts, which must stay unchanged. Outside the grader,
// MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps: only text_max_bytes shapes the bytes; the other limits
// refuse an entry the scorer would refuse (more than 4 screenshots or one over
// 256 KiB; more than 993 files and directories in app/ or 48 MiB of app files).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
console.log('Leonida Trophy Guide written to ' + out);
