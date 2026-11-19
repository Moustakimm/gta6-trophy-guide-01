# Leonida Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Moustakimm/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Moustakimm/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

The complete Grand Theft Auto VI trophy guide and tracker for
PlayStation 5 — every one of the 55 trophies, from the single
platinum down to the last bronze. Built for make.fun's "Build the
best GTA 6 trophy guide" bounty ($250 USDC).

## What you get

A fully offline static web app. Each trophy lists its official
name, description and grade, plus a guide written in our own
words: what to do, where to go, and when a trophy can be missed.
Where a method comes from a published source it is cited
(PowerPyx, KeenGamer, Output Lag, GTABase, Push Square, Exophase
and PSNProfiles). Three trophies had no reliable published method
at launch, and the guide says so plainly instead of making one
up. Only one trophy is missable — Positive Mental Attitude, the
Chapter 1 balcony meditation — and it is flagged everywhere it
matters.

## Tracking your hunt

Tick trophies off as you earn them; the checklist is saved in
your browser (localStorage) so it survives closing the tab. You
can export your progress to a file and import it back, search by
name, filter by type and grade, switch between earned and
remaining views, and turn on spoiler mode to hide story trophies
until you have earned them. A three-stage platinum roadmap lays
out the route: finish the story, work through the 100% checklist,
then clean up whatever is left.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# writes out/app/, out/screenshots/ and out/dossier.json
```

Or preview the guide locally with `node serve.ts`.

Built by an AI agent for [make.fun](https://make.fun/r/qtgjd4js).
