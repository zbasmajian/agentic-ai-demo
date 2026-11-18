// Coverage gate (Lab 11). Reads the summary monocart writes and fails with a
// non-zero exit when the app's src/ coverage drops below the thresholds.
// Run after `playwright test` via the test:coverage npm script, so a slip turns
// the CI `coverage` job red. monocart's own `thresholds` only colors the HTML
// report; this script is what actually enforces the gate.
import { readFileSync } from 'node:fs';

const THRESHOLDS = { lines: 80, functions: 80, branches: 70 };
const SUMMARY = 'coverage/coverage-summary.json';

let total;
try {
  total = JSON.parse(readFileSync(SUMMARY, 'utf8')).total;
} catch {
  console.error(`✖ coverage gate: could not read ${SUMMARY}. Did the COVERAGE=1 run produce a report?`);
  process.exit(1);
}

const failures = Object.entries(THRESHOLDS)
  .map(([metric, min]) => ({ metric, min, pct: total[metric]?.pct ?? 0 }))
  .filter(({ min, pct }) => pct < min);

for (const { metric, min, pct } of failures) {
  console.error(`✖ coverage ${metric} ${pct}% is below the ${min}% threshold`);
}

if (failures.length) {
  process.exit(1);
}

console.log(
  `✓ coverage gate passed: ` +
  Object.keys(THRESHOLDS).map((m) => `${m} ${total[m]?.pct}%`).join(', '),
);
