"use client";

import Link from "next/link";
import { useState } from "react";
import { leetcodeUrl, SHEET, SHEET_DIFFICULTIES, SHEET_TOTAL, sheetKey, type SheetDifficulty, type SheetProblem } from "@/lib/sheet/problems";
import { useProgress } from "@/lib/store/progress";
import { cx } from "@/lib/utils";
import s from "./sheet.module.css";

export function Sheet() {
  const { state, ready, user, setProblem } = useProgress();
  const [difficulty, setDifficulty] = useState<SheetDifficulty | "all">("all");
  const [unsolvedOnly, setUnsolvedOnly] = useState(false);

  const solvedOf = (p: SheetProblem) => ready && state.problems[sheetKey(p)]?.status === "solved";

  const groups = SHEET.map((g) => {
    const solved = g.problems.filter((p) => solvedOf(p)).length;
    const problems = g.problems.filter((p) => {
      if (difficulty !== "all" && p.difficulty !== difficulty) return false;
      if (unsolvedOnly && solvedOf(p)) return false;
      return true;
    });
    return { id: g.id, title: g.title, lesson: g.lesson, total: g.problems.length, solved, problems };
  }).filter((g) => g.problems.length > 0);

  const solved = ready ? SHEET.reduce((n, g) => n + g.problems.filter((p) => state.problems[sheetKey(p)]?.status === "solved").length, 0) : 0;
  const pct = Math.round((solved / SHEET_TOTAL) * 100);

  return (
    <div className="container page">
      <header className={s.head}>
        <div className="eyebrow">Sheet</div>
        <h1>150 interview problems, by pattern.</h1>
        <p className={s.lead}>
          Work through one pattern at a time. Each title opens the problem on LeetCode. Where a lesson on this site teaches the pattern, it is linked beside the group.
        </p>
        <p className={s.credit}>
          Problem list based on NeetCode 150 (
          <a href="https://neetcode.io" target="_blank" rel="noopener noreferrer">
            neetcode.io
          </a>
          ).
        </p>
      </header>

      <div className={s.progress}>
        <div className={s.progressTop}>
          <p>
            <span className={s.count}>{solved}</span>
            <span className="faint"> / {SHEET_TOTAL} solved</span>
          </p>
          <p className={s.save}>
            {ready ? (
              user ? (
                "Saved to your account."
              ) : (
                <>
                  Saved in this browser. <Link href="/sign-in">Sign in</Link> to keep it.
                </>
              )
            ) : (
              "\u00a0"
            )}
          </p>
        </div>
        <div className={s.bar} role="progressbar" aria-valuenow={solved} aria-valuemin={0} aria-valuemax={SHEET_TOTAL} aria-label={`${solved} of ${SHEET_TOTAL} problems solved`}>
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className={s.toolbar}>
        <div className={s.filters} role="group" aria-label="Difficulty">
          <button type="button" className="chip" aria-pressed={difficulty === "all"} onClick={() => setDifficulty("all")}>
            All
          </button>
          {SHEET_DIFFICULTIES.map((d) => (
            <button key={d} type="button" className="chip" aria-pressed={difficulty === d} onClick={() => setDifficulty(d)}>
              {d}
            </button>
          ))}
          <button type="button" className="chip" aria-pressed={unsolvedOnly} onClick={() => setUnsolvedOnly((v) => !v)}>
            Unsolved only
          </button>
        </div>
      </div>

      {groups.length > 0 && (
        <nav className={s.index} aria-label="Patterns">
          {groups.map((g) => (
            <a key={g.id} href={`#${g.id}`}>
              {g.title}
              <span>
                {g.solved}/{g.total}
              </span>
            </a>
          ))}
        </nav>
      )}

      {groups.length === 0 ? (
        <p className={s.empty}>Nothing matches these filters.</p>
      ) : (
        groups.map((g) => (
          <section key={g.id} id={g.id} className={s.group} aria-labelledby={`${g.id}-title`}>
              <div className={s.groupHead}>
                <h2 id={`${g.id}-title`}>{g.title}</h2>
                <p className={s.groupMeta}>
                  {g.lesson && (
                    <Link href={g.lesson.href} className={s.lesson}>
                      Lesson: {g.lesson.title}
                    </Link>
                  )}
                  <span className="mono faint">
                    {g.solved}/{g.total}
                  </span>
                </p>
              </div>
              <ul className={s.list}>
                {g.problems.map((p) => {
                  const on = solvedOf(p);
                  return (
                    <li key={p.id} className={cx(s.row, on && s.done)}>
                      <label className={s.check}>
                        <input
                          type="checkbox"
                          checked={on}
                          aria-label={`Mark ${p.title} as solved`}
                          onChange={(e) => setProblem(sheetKey(p), e.target.checked ? "solved" : null)}
                        />
                      </label>
                      <a className={s.title} href={leetcodeUrl(p)} target="_blank" rel="noopener noreferrer">
                        {p.title}
                      </a>
                      <span className={s.diff} data-d={p.difficulty}>
                        {p.difficulty}
                      </span>
                    </li>
                  );
                })}
              </ul>
          </section>
        ))
      )}
    </div>
  );
}
