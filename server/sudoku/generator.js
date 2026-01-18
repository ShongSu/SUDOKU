const { solveWithUniqueness } = require("./solver");
const { classifyDifficulty } = require("./difficulty");

/**
 * Generate a Sudoku puzzle with a unique solution and approximate difficulty.
 *
 * Approach:
 * 1) Generate a full valid solved grid (randomized backtracking).
 * 2) Remove numbers (optionally with 180° rotational symmetry).
 * 3) After each removal, verify the puzzle still has a unique solution.
 * 4) Evaluate difficulty using Part 2 classifyDifficulty(stats).
 * 5) Keep removing while the puzzle is not harder than the target difficulty,
 *    and pick the "best" candidate close to the upper bound of the target.
 *
 * Why min blanks?
 * Without a minimum blank constraint, "Easy" can be reached with only a few
 * removals (almost-complete puzzle), which is too trivial for typical Sudoku.
 *
 * @param {{
 *   targetLevel?: "Easy"|"Medium"|"Hard"|"Samurai",
 *   symmetry?: boolean,
 *   maxAttempts?: number,
 *   maxRemovals?: number,
 *   minBlanks?: number,
 *   maxNodesUniqueCheck?: number,
 *   maxNodesDifficultyCheck?: number,
 *   preferHigherScoreWithinLevel?: boolean,
 * }} options
 *
 * @returns {{
 *   puzzle: number[][],
 *   solution: number[][],
 *   givens: number,
 *   blanks: number,
 *   difficulty: { level: "Easy"|"Medium"|"Hard"|"Samurai", score: number },
 *   stats: { nodes: number, guesses: number, maxDepth: number },
 * }}
 */
function generateSudoku(options = {}) {
  const {
    targetLevel = "Medium",
    symmetry = true,
    maxAttempts = 40,
    maxRemovals = 60,

    // If not provided, use defaults below based on target level
    minBlanks,

    // Safety: only works if your solveWithUniqueness supports (grid, {maxNodes})
    maxNodesUniqueCheck = 150000,
    maxNodesDifficultyCheck = 250000,

    // Pick the puzzle closest to the upper boundary of the target level
    preferHigherScoreWithinLevel = true,
  } = options;

  const minBlanksByLevel = {
    // Tune these if you have official samples; these are practical defaults:
    Easy: 35,     // ~46 givens
    Medium: 45,   // ~36 givens
    Hard: 52,     // ~29 givens
    Samurai: 58,  // ~23 givens
  };

  const targetMinBlanks = Number.isInteger(minBlanks)
    ? minBlanks
    : (minBlanksByLevel[targetLevel] ?? 40);

  let bestOverall = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const solution = generateFullSolution();
    let puzzle = cloneGrid(solution);

    // Create list of indices to try removing from
    const indices = Array.from({ length: 81 }, (_, i) => i);
    shuffleInPlace(indices);

    let bestThisAttempt = null;
    let removals = 0;

    for (const idx of indices) {
      if (removals >= maxRemovals) break;

      const r = Math.floor(idx / 9);
      const c = idx % 9;

      // 180° rotational symmetry
      const r2 = 8 - r;
      const c2 = 8 - c;

      // Skip if already empty
      if (puzzle[r][c] === 0) continue;
      if (symmetry && puzzle[r2][c2] === 0) continue;

      // Remove values (1 or 2 cells)
      const old1 = puzzle[r][c];
      const old2 = puzzle[r2][c2];

      puzzle[r][c] = 0;
      if (symmetry) puzzle[r2][c2] = 0;

      // 1) Uniqueness check
      const uniqRes = safeSolveWithLimits(puzzle, maxNodesUniqueCheck);
      if (!uniqRes.solved || !uniqRes.unique) {
        // revert
        puzzle[r][c] = old1;
        if (symmetry) puzzle[r2][c2] = old2;
        continue;
      }

      removals += symmetry && !(r === r2 && c === c2) ? 2 : 1;

      // 2) Difficulty check (using same solver stats)
      const diffRes = safeSolveWithLimits(puzzle, maxNodesDifficultyCheck);
      if (!diffRes.solved || !diffRes.unique) {
        // revert (rare, but safe)
        puzzle[r][c] = old1;
        if (symmetry) puzzle[r2][c2] = old2;
        removals -= symmetry && !(r === r2 && c === c2) ? 2 : 1;
        continue;
      }

      const difficulty = classifyDifficulty(diffRes.stats);
      const blanks = countBlanks(puzzle);

      // If it becomes harder than target, stop removing further for this attempt
      if (levelRank(difficulty.level) > levelRank(targetLevel)) {
        // revert the last removal because it crossed the boundary
        puzzle[r][c] = old1;
        if (symmetry) puzzle[r2][c2] = old2;
        removals -= symmetry && !(r === r2 && c === c2) ? 2 : 1;
        break;
      }

      // Candidate acceptance:
      // must match target difficulty AND have enough blanks to avoid trivial puzzles.
      if (difficulty.level === targetLevel && blanks >= targetMinBlanks) {
        const candidate = {
          puzzle: cloneGrid(puzzle),
          solution: cloneGrid(solution),
          givens: countGivens(puzzle),
          blanks,
          difficulty,
          stats: diffRes.stats,
        };

        if (!bestThisAttempt) {
          bestThisAttempt = candidate;
        } else if (preferHigherScoreWithinLevel) {
          // Keep the one closest to the upper bound (higher score within same level)
          if (candidate.difficulty.score > bestThisAttempt.difficulty.score) {
            bestThisAttempt = candidate;
          }
        } else {
          // Alternatively: prefer more blanks (harder-looking within level)
          if (candidate.blanks > bestThisAttempt.blanks) {
            bestThisAttempt = candidate;
          }
        }
      }
    }

    if (bestThisAttempt) {
      // Return immediately, or keep bestOverall and try more attempts.
      // Here we return early for speed, but keep bestOverall fallback below.
      return bestThisAttempt;
    }

    // Track best attempt overall (fallback) even if it didn't hit target exactly.
    // Example strategy: keep closest level rank not exceeding target, with enough blanks.
    const fallback = buildFallbackCandidate(puzzle, solution, targetLevel, targetMinBlanks, maxNodesDifficultyCheck);
    if (fallback) {
      if (!bestOverall || betterFallback(fallback, bestOverall, targetLevel)) {
        bestOverall = fallback;
      }
    }
  }

  if (bestOverall) return bestOverall;

  throw new Error(`Failed to generate a ${targetLevel} puzzle within maxAttempts=${maxAttempts}. Try increasing maxAttempts/maxRemovals.`);
}

/* --------------------------- fallback helpers --------------------------- */

function buildFallbackCandidate(puzzle, solution, targetLevel, minBlanks, maxNodes) {
  const res = safeSolveWithLimits(puzzle, maxNodes);
  if (!res.solved || !res.unique) return null;

  const difficulty = classifyDifficulty(res.stats);
  const blanks = countBlanks(puzzle);
  if (blanks < minBlanks) return null;

  // Only accept fallback that is not harder than target
  if (levelRank(difficulty.level) > levelRank(targetLevel)) return null;

  return {
    puzzle: cloneGrid(puzzle),
    solution: cloneGrid(solution),
    givens: countGivens(puzzle),
    blanks,
    difficulty,
    stats: res.stats,
  };
}

function betterFallback(a, b, targetLevel) {
  // Prefer closer to target level rank, then higher score, then more blanks
  const ta = levelRank(targetLevel) - levelRank(a.difficulty.level);
  const tb = levelRank(targetLevel) - levelRank(b.difficulty.level);

  if (ta < tb) return true;
  if (ta > tb) return false;

  if (a.difficulty.score > b.difficulty.score) return true;
  if (a.difficulty.score < b.difficulty.score) return false;

  return a.blanks > b.blanks;
}

function levelRank(level) {
  return { Easy: 1, Medium: 2, Hard: 3, Samurai: 4 }[level] ?? 999;
}

/* --------------------------- core generation --------------------------- */

function safeSolveWithLimits(grid, maxNodes) {
  // If your solver supports options: solveWithUniqueness(grid, { maxNodes })
  // it will cap worst-case searches. Otherwise the second arg is ignored.
  try {
    return solveWithUniqueness.length >= 2
      ? solveWithUniqueness(grid, { maxNodes })
      : solveWithUniqueness(grid);
  } catch (e) {
    return {
      solutions: 0,
      unique: false,
      solved: false,
      solution: null,
      stats: { nodes: 0, guesses: 0, maxDepth: 0 },
      aborted: true,
      error: e?.message || String(e),
    };
  }
}

function generateFullSolution() {
  const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  const ok = fillGridRandom(grid);
  if (!ok) throw new Error("Failed to generate a full Sudoku solution.");
  return grid;
}

/**
 * Randomized backtracking fill to produce a full valid solved grid.
 * Uses MRV heuristic and shuffles candidate order for randomness.
 */
function fillGridRandom(grid) {
  const pick = pickNextCellMRV(grid);
  if (!pick) return true; // complete
  if (pick.dead) return false;

  const { r, c, cand } = pick;
  shuffleInPlace(cand);

  for (const v of cand) {
    grid[r][c] = v;
    if (fillGridRandom(grid)) return true;
    grid[r][c] = 0;
  }
  return false;
}

// MRV: choose the empty cell with the fewest candidates
function pickNextCellMRV(grid) {
  let best = null;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== 0) continue;
      const cand = getCandidates(grid, r, c);
      if (cand.length === 0) return { dead: true };
      if (!best || cand.length < best.cand.length) {
        best = { r, c, cand };
        if (cand.length === 1) return best;
      }
    }
  }
  return best; // null means solved
}

function getCandidates(grid, r, c) {
  if (grid[r][c] !== 0) return [];

  const used = new Set();

  for (let i = 0; i < 9; i++) {
    if (grid[r][i] !== 0) used.add(grid[r][i]);
    if (grid[i][c] !== 0) used.add(grid[i][c]);
  }

  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let rr = br; rr < br + 3; rr++) {
    for (let cc = bc; cc < bc + 3; cc++) {
      if (grid[rr][cc] !== 0) used.add(grid[rr][cc]);
    }
  }

  const cand = [];
  for (let v = 1; v <= 9; v++) if (!used.has(v)) cand.push(v);
  return cand;
}

/* --------------------------- utilities --------------------------- */

function cloneGrid(grid) {
  return grid.map((row) => row.slice());
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function countGivens(grid) {
  let n = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) if (grid[r][c] !== 0) n++;
  }
  return n;
}

function countBlanks(grid) {
  return 81 - countGivens(grid);
}

module.exports = { generateSudoku };
