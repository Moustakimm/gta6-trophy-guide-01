// Leonida Trophy Guide: tracker for the 55 GTA VI trophies.
// Loads app/data/trophies.json (official names, descriptions, grades + our guides),
// renders one card per trophy, and saves earned ticks in localStorage.
// Filters: search text, kind (story / missable / collectibles / activities / robberies /
// side characters / exploration / combat / money / one-offs / 100% / online), grade,
// earned status. Spoiler mode hides story and side-character trophies until earned.
// Export writes the earned names to a JSON file; import reads one back.
const EARNED_KEY = 'gta6-trophy-checklist-v1';
const SPOILER_KEY = 'gta6-trophy-spoiler-v1';

const listEl = document.getElementById('list');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const statusEl = document.getElementById('status');
const spoilerEl = document.getElementById('spoiler');
const metaEl = document.getElementById('listMeta');

let earned = new Set(readJson(EARNED_KEY, []));
spoilerEl.checked = localStorage.getItem(SPOILER_KEY) === '1';

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const sources = doc.sources;

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? 'null');
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function saveEarned() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort()));
}

function saveSpoiler() {
  localStorage.setItem(SPOILER_KEY, spoilerEl.checked ? '1' : '0');
}

function kindLabel(trophy) {
  const labels = {
    platinum: 'Platinum', story: 'Story', side: 'Side character',
    collectible: 'Collectible', activity: 'Activity', robbery: 'Robbery',
    exploration: 'Exploration', combat: 'Combat', money: 'Money & property',
    misc: 'One-off', completion: '100% completion',
  };
  return labels[trophy.kind] ?? trophy.kind;
}

function isStorySpoiler(trophy) {
  return trophy.kind === 'story' || trophy.kind === 'side';
}

function trophyMatches(trophy) {
  const query = searchEl.value.trim().toLowerCase();
  if (query) {
    const haystack = [trophy.name, trophy.description, trophy.guide, trophy.when ?? '', trophy.count ?? ''].join(' ').toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  if (kindEl.value === 'missable') {
    if (!trophy.missable) return false;
  } else if (kindEl.value === 'online') {
    return false;
  } else if (kindEl.value !== 'all' && trophy.kind !== kindEl.value) {
    return false;
  }
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  const has = earned.has(trophy.name);
  if (statusEl.value === 'earned' && !has) return false;
  if (statusEl.value === 'remaining' && has) return false;
  return true;
}

function sourceLinks(trophy) {
  const wrap = document.createElement('p');
  wrap.className = 'sources-line';
  wrap.append('Sources: ');
  (trophy.sources ?? ['official']).forEach((key, index) => {
    const info = sources[key];
    if (!info) return;
    if (index > 0) wrap.append(' · ');
    const link = document.createElement('a');
    link.href = info.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = info.name;
    wrap.append(link);
  });
  return wrap;
}

function trophyCard(trophy) {
  const has = earned.has(trophy.name);
  const hidden = spoilerEl.checked && isStorySpoiler(trophy) && !has;
  const card = document.createElement('article');
  card.className = 'card' + (has ? ' earned' : '') + (trophy.missable ? ' missable-card' : '');
  card.dataset.name = trophy.name;

  const head = document.createElement('div');
  head.className = 'card-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = has;
  box.setAttribute('aria-label', 'Mark ' + trophy.name + ' earned');
  box.addEventListener('change', () => {
    if (box.checked) earned.add(trophy.name);
    else earned.delete(trophy.name);
    saveEarned();
    render();
  });
  head.append(box);

  const name = document.createElement('h3');
  name.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  head.append(name);

  const grade = document.createElement('span');
  grade.className = 'badge grade-' + trophy.grade;
  grade.textContent = trophy.grade;
  head.append(grade);

  const kind = document.createElement('span');
  kind.className = 'badge kind';
  kind.textContent = kindLabel(trophy);
  head.append(kind);

  if (trophy.missable) {
    const flag = document.createElement('span');
    flag.className = 'badge missable';
    flag.textContent = 'Possibly missable';
    head.append(flag);
  }
  card.append(head);

  if (hidden) {
    const note = document.createElement('p');
    note.className = 'spoiler-note';
    note.textContent = 'Hidden on PlayStation until earned — tick the box once you have earned it in-game to reveal its name, description and guide. Untick “Hide story trophies until earned” above to show all story trophies.';
    card.append(note);
    return card;
  }

  const desc = document.createElement('p');
  desc.className = 'official';
  desc.textContent = trophy.description;
  card.append(desc);

  const meta = document.createElement('p');
  meta.className = 'meta';
  const bits = [];
  if (trophy.when) bits.push(trophy.when);
  if (trophy.count) bits.push(trophy.count);
  bits.push('Stage ' + trophy.stage);
  meta.textContent = bits.join(' · ');
  card.append(meta);

  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = trophy.guide;
  card.append(guide);

  card.append(sourceLinks(trophy));
  return card;
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.name)).length;
  document.getElementById('earnedCount').textContent = done;
  document.getElementById('progressFill').style.width = (done / total * 100) + '%';
  const others = total - 1;
  const othersDone = trophies.filter((t) => t.grade !== 'platinum' && earned.has(t.name)).length;
  document.getElementById('progressSub').textContent =
    'Platinum: Vice Got a Price! — ' + othersDone + ' of ' + others + ' others earned';
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((grade) => {
    const inGrade = trophies.filter((t) => t.grade === grade);
    const got = inGrade.filter((t) => earned.has(t.name)).length;
    return grade + ' ' + got + '/' + inGrade.length;
  });
  document.getElementById('gradeCounts').textContent = counts.join(' · ');
}

function renderSources() {
  const ul = document.getElementById('sourceList');
  ul.replaceChildren();
  for (const [key, info] of Object.entries(sources)) {
    if (key === 'official') continue;
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = info.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = info.name;
    li.append(link);
    ul.append(li);
  }
}

function render() {
  renderProgress();
  const shown = trophies.filter(trophyMatches);
  metaEl.textContent = kindEl.value === 'online'
    ? 'No online trophies — all 55 are single-player, so there is nothing to track here.'
    : 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies'
      + (spoilerEl.checked ? ' · story trophies hidden until earned' : '');
  listEl.replaceChildren();
  if (shown.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = kindEl.value === 'online'
      ? 'There are no online trophies in GTA VI at launch. Every trophy unlocks in single-player.'
      : 'No trophies match these filters. Clear the search or change a filter.';
    listEl.append(empty);
    return;
  }
  for (const trophy of shown) listEl.append(trophyCard(trophy));
}

function exportProgress() {
  const payload = {
    guide: 'Leonida Trophy Guide — GTA VI (PS5)',
    exported: new Date().toISOString(),
    earned: [...earned].sort(),
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

async function importProgress(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    const known = new Set(trophies.map((t) => t.name));
    const kept = names.filter((name) => known.has(name));
    earned = new Set(kept);
    saveEarned();
    render();
    metaEl.textContent = 'Imported ' + kept.length + ' earned trophies'
      + (names.length - kept.length > 0 ? ' (' + (names.length - kept.length) + ' unknown names ignored)' : '') + '.';
  } catch {
    metaEl.textContent = 'That file could not be imported — it is not a progress file from this guide.';
  }
}

document.getElementById('export').addEventListener('click', exportProgress);
document.getElementById('import').addEventListener('change', (event) => {
  importProgress(event.target.files[0]);
  event.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (!window.confirm('Clear all earned ticks? You can export a backup first.')) return;
  earned = new Set();
  saveEarned();
  render();
});
for (const el of [searchEl, kindEl, gradeEl, statusEl]) el.addEventListener('input', render);
spoilerEl.addEventListener('change', () => {
  saveSpoiler();
  render();
});

renderSources();
render();
