import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { leetcodeUrl, SHEET, SHEET_DIFFICULTIES, SHEET_TOTAL, sheetKey, type SheetDifficulty } from "./problems";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const allowed = new Set<string>(SHEET_DIFFICULTIES);
const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const GROUP_ORDER = [
  "arrays-hashing",
  "two-pointers",
  "sliding-window",
  "stack",
  "binary-search",
  "linked-list",
  "trees",
  "tries",
  "heap",
  "backtracking",
  "graphs",
  "advanced-graphs",
  "dp-1d",
  "dp-2d",
  "greedy",
  "intervals",
  "math-geometry",
  "bit-manipulation",
];

function lessonExists(href: string): boolean {
  const m = /^\/learn\/dsa\/([a-z0-9-]+)$/.exec(href);
  if (!m) return false;
  const want = `${m[1]}.md`;
  const dir = path.join(root, "content/dsa");
  for (const stage of fs.readdirSync(dir)) {
    const stageDir = path.join(dir, stage);
    if (!fs.statSync(stageDir).isDirectory()) continue;
    for (const file of fs.readdirSync(stageDir)) {
      if (file.endsWith(want) && file.slice(file.indexOf("-") + 1) === want) return true;
    }
  }
  return false;
}

test("interview sheet is 150 problems with unique ids, slugs, and a valid difficulty", () => {
  const problems = SHEET.flatMap((g) => g.problems);
  assert.equal(problems.length, 150);
  assert.equal(SHEET_TOTAL, 150);

  const ids = problems.map((p) => p.id);
  const slugs = problems.map((p) => p.slug);
  assert.equal(new Set(ids).size, 150, "ids must be unique");
  assert.equal(new Set(slugs).size, 150, "slugs must be unique");

  const counts: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
  for (const p of problems) {
    assert.equal(p.id, p.slug);
    assert.match(p.slug, slugRe);
    assert.ok(p.title.trim().length > 1);
    assert.ok(allowed.has(p.difficulty), p.difficulty);
    counts[p.difficulty as SheetDifficulty]++;
    const key = sheetKey(p);
    assert.equal(key, `lc:${p.slug}`);
    assert.ok(key.length <= 200);
    assert.equal(leetcodeUrl(p), `https://leetcode.com/problems/${p.slug}/`);
  }
  assert.deepEqual(counts, { Easy: 28, Medium: 101, Hard: 21 });

  assert.deepEqual(
    SHEET.map((g) => g.id),
    GROUP_ORDER,
  );
  assert.equal(new Set(SHEET.map((g) => g.id)).size, SHEET.length);
  for (const g of SHEET) {
    assert.ok(g.problems.length > 0, g.id);
    assert.ok(g.title.trim().length > 1);
    if (!g.lesson) continue;
    assert.equal(lessonExists(g.lesson.href), true, g.lesson.href);
    assert.ok(g.lesson.title.trim().length > 1);
  }

  const byId = Object.fromEntries(SHEET.map((g) => [g.id, g]));
  assert.equal(byId["binary-search"]?.lesson?.href, "/learn/dsa/binary-search");
  assert.equal(byId["linked-list"]?.lesson, undefined);
  assert.equal(byId["math-geometry"]?.lesson, undefined);
});
