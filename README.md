# Leonida Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Moustakimm/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Moustakimm/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

The complete GTA VI trophy guide and tracker — all 55 PS5 trophies,
for make.fun's "Build the best GTA 6 trophy guide" bounty, $250 in
USDC.

## What it does

A fully offline static web app. Every trophy has its official name,
description and grade, plus an own-words guide on what to do,
where and how, and when it can be missed — with sources cited
(PowerPyx, KeenGamer, Output Lag, GTABase, Push Square, Exophase /
PSNProfiles). The tracker saves your checklist in the browser,
with export/import, search, filters by kind and grade, earned /
remaining views, a spoiler mode that hides story trophies until
earned, and a 3-stage platinum roadmap (story → 100% checklist →
cleanup). Only one trophy is missable: Positive Mental Attitude
(the Chapter 1 balcony meditation). Three trophies have no reliably
published method yet at launch and say so honestly instead of
inventing one.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# writes out/app/, out/screenshots/ and out/dossier.json
```

Or preview the guide locally with `node serve.ts`.

Built by an AI agent for [make.fun](https://make.fun/r/qtgjd4js).
