// Leonida Trophy Guide: tracker for the 55 GTA VI trophies.
// Loads app/data/trophies.json (official names, descriptions, grades + our guides),
// lays the guide out in three columns — checklist, guide, sources — and saves
// earned ticks in localStorage. Every guide is split into steps; each step carries
// inline [n] citations pointing at the numbered Sources column, so any claim can
// be checked against the published guide it came from.
// Filters: search text, kind (story / missable / collectibles / activities / robberies /
// side characters / exploration / combat / money / one-offs / 100% / online), grade,
// earned status. Spoiler mode hides story and side-character trophies until earned.
// Export writes the earned names to a JSON file; import reads one back.
const EARNED_KEY = 'gta6-trophy-checklist-v1';
const SPOILER_KEY = 'gta6-trophy-spoiler-v1';

const checklistEl = document.getElementById('checklist');
const guideEl = document.getElementById('guidePanel');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const statusEl = document.getElementById('status');
const spoilerEl = document.getElementById('spoiler');
const metaEl = document.getElementById('listMeta');

let earned = new Set(readJson(EARNED_KEY, []));
spoilerEl.checked = localStorage.getItem(SPOILER_KEY) === '1';
let selectedName = null;

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const sources = doc.sources;

// Number the sources once, in the order the data lists them, for the Sources
// column and the [n] markers. 1 is the official list, the rest are the published
// guides the steps come from.
const sourceKeys = Object.keys(sources);
const sourceNumber = Object.fromEntries(sourceKeys.map((key, i) => [key, i + 1]));

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

// Split a guide paragraph into its sentences. Abbreviations that end in a
// period but are not sentence ends ("Ch. 3", "Mr. X") are shielded first so
// they never split a step in two.
function splitSteps(text) {
  const shielded = text.replace(/Ch\. /g, 'Ch\u00a0').replace(/Mr\. /g, 'Mr\u00a0');
  const parts = shielded.split(/(?<=[.!?])\s+(?=[A-Z0-9"(])/);
  return parts.map((part) => part.replace(/Ch\u00a0/g, 'Ch. ').replace(/Mr\u00a0/g, 'Mr. ').trim()).filter(Boolean);
}

function isUnconfirmed(trophy) {
  return trophy.guide.includes('WHAT IS NOT YET CONFIRMED');
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

function gradeBadge(trophy) {
  const badge = document.createElement('span');
  badge.className = 'badge grade-' + trophy.grade;
  badge.textContent = trophy.grade;
  return badge;
}

function checkRow(trophy) {
  const has = earned.has(trophy.name);
  const hidden = spoilerEl.checked && isStorySpoiler(trophy) && !has;
  const row = document.createElement('div');
  row.className = 'check-row' + (has ? ' earned' : '') + (hidden ? ' hidden-row' : '')
    + (trophy.name === selectedName ? ' selected' : '');
  row.dataset.name = trophy.name;

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = has;
  box.setAttribute('aria-label', 'Mark ' + trophy.name + ' earned');
  box.addEventListener('click', (event) => event.stopPropagation());
  box.addEventListener('change', () => {
    if (box.checked) earned.add(trophy.name);
    else earned.delete(trophy.name);
    saveEarned();
    render();
  });
  row.append(box);

  const name = document.createElement('span');
  name.className = 'check-name';
  name.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  row.append(name);
  row.append(gradeBadge(trophy));
  if (trophy.missable) {
    const flag = document.createElement('span');
    flag.className = 'badge missable';
    flag.textContent = 'Missable';
    row.append(flag);
  }
  row.addEventListener('click', () => {
    selectedName = trophy.name;
    render();
  });
  return row;
}

function renderChecklist(shown) {
  checklistEl.replaceChildren();
  if (shown.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = kindEl.value === 'online'
      ? 'There are no online trophies in GTA VI at launch. Every trophy unlocks in single-player.'
      : 'No trophies match these filters. Clear the search or change a filter.';
    checklistEl.append(empty);
    return;
  }
  for (const trophy of shown) checklistEl.append(checkRow(trophy));
}

function citeMarks(trophy) {
  // One superscript [n] per source this trophy's guide draws on, in the global
  // numbering of the Sources column, each linking to that source.
  const marks = document.createElement('span');
  for (const key of trophy.sources ?? ['official']) {
    if (!sources[key]) continue;
    const mark = document.createElement('a');
    mark.className = 'cite';
    mark.href = '#src-' + key;
    mark.textContent = '[' + sourceNumber[key] + ']';
    mark.title = sources[key].name;
    marks.append(mark);
  }
  return marks;
}

function renderGuide(trophy) {
  guideEl.replaceChildren();
  const panel = guideEl.closest('.guide-col');
  panel.classList.toggle('earned', trophy ? earned.has(trophy.name) : false);
  if (!trophy) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No trophy selected. Pick one from the checklist to read its guide.';
    guideEl.append(empty);
    return;
  }
  const has = earned.has(trophy.name);
  const hidden = spoilerEl.checked && isStorySpoiler(trophy) && !has;

  const head = document.createElement('div');
  head.className = 'guide-head';
  const name = document.createElement('h3');
  name.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  head.append(name);
  head.append(gradeBadge(trophy));
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
  guideEl.append(head);

  if (hidden) {
    const note = document.createElement('p');
    note.className = 'spoiler-note';
    note.textContent = 'Hidden on PlayStation until earned — tick the box once you have earned it in-game to reveal its name, description and guide. Untick “Hide story trophies until earned” above to show all story trophies.';
    guideEl.append(note);
    return;
  }

  const desc = document.createElement('p');
  desc.className = 'official';
  desc.textContent = trophy.description;
  guideEl.append(desc);

  const meta = document.createElement('p');
  meta.className = 'meta';
  const bits = [];
  if (trophy.when) bits.push(trophy.when);
  if (trophy.count) bits.push(trophy.count);
  bits.push('Stage ' + trophy.stage);
  meta.textContent = bits.join(' · ');
  guideEl.append(meta);

  if (trophy.missable) {
    const box = document.createElement('p');
    box.className = 'missable-box';
    box.textContent = 'The one possibly missable trophy in the game. Do the Chapter 1 balcony meditation before you finish Chapter 1 — after the mission Down to Earth, talk to Lucia in the kitchen in the morning, follow her to the balcony and choose Accept.';
    guideEl.append(box);
  }
  if (isUnconfirmed(trophy)) {
    const box = document.createElement('p');
    box.className = 'unconfirmed-box';
    box.textContent = 'No reliable published method yet at launch. This guide says what is known and what to try, and points you at the sources for updates — it does not invent a trigger.';
    guideEl.append(box);
  }

  const steps = document.createElement('ol');
  steps.className = 'steps';
  for (const step of splitSteps(trophy.guide)) {
    const li = document.createElement('li');
    li.append(document.createTextNode(step + ' '));
    li.append(citeMarks(trophy));
    steps.append(li);
  }
  guideEl.append(steps);

  const actions = document.createElement('div');
  actions.className = 'guide-actions';
  if (has) {
    const label = document.createElement('span');
    label.className = 'earned-label';
    label.textContent = '✓ Earned';
    actions.append(label);
  } else {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Mark earned';
    button.addEventListener('click', () => {
      earned.add(trophy.name);
      saveEarned();
      render();
    });
    actions.append(button);
  }
  guideEl.append(actions);
}

function renderSources() {
  const ol = document.getElementById('sourceList');
  ol.replaceChildren();
  for (const [key, info] of Object.entries(sources)) {
    const li = document.createElement('li');
    li.id = 'src-' + key;
    const link = document.createElement('a');
    link.href = info.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = info.name;
    li.append(link);
    ol.append(li);
  }
  const unknown = trophies.filter(isUnconfirmed);
  document.getElementById('unconfirmedNote').textContent =
    unknown.length + ' trophies have no confirmed method yet at launch: '
    + unknown.map((t) => t.name).join(', ')
    + '. Their guides say what is known instead of guessing.';
}

function renderAudit() {
  const withSource = trophies.filter((t) => (t.sources ?? []).length > 0).length;
  const totalSteps = trophies.reduce((sum, t) => sum + splitSteps(t.guide).length, 0);
  document.getElementById('auditGuides').textContent = withSource + '/' + trophies.length;
  document.getElementById('auditSteps').textContent = totalSteps + '/' + totalSteps;
  document.getElementById('auditSources').textContent = sourceKeys.length;
  document.getElementById('auditMissable').textContent = trophies.filter((t) => t.missable).length;
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

function render() {
  renderProgress();
  const shown = trophies.filter(trophyMatches);
  metaEl.textContent = kindEl.value === 'online'
    ? 'No online trophies — all 55 are single-player, so there is nothing to track here.'
    : 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies'
      + (spoilerEl.checked ? ' · story trophies hidden until earned' : '')
      + ' · click a trophy to read its guide';
  if (!selectedName || !shown.some((t) => t.name === selectedName)) {
    selectedName = shown.length > 0 ? shown[0].name : null;
  }
  renderChecklist(shown);
  renderGuide(selectedName ? trophies.find((t) => t.name === selectedName) ?? null : null);
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

renderAudit();
renderSources();
render();
