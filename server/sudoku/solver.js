
/**
 * Creates a deep copy of a Sudoku grid.
 *
 * This is required because the solver mutates the grid during
 * backtracking and we want to preserve the original input.
 *
 * @param {number[][]} grid - A 9×9 Sudoku grid.
 * @returns {number[][]} A deep-cloned 9×9 grid.
 */
function cloneGrid(grid) {
  return grid.map((row) => row.slice());
}


/**
 * Computes all valid candidate values for a given empty cell.
 *
 * A candidate is valid if it does not already appear in:
 * - the same row
 * - the same column
 * - the same 3×3 subgrid
 *
 * @param {number[][]} grid - A 9×9 Sudoku grid.
 * @param {number} r - Row index of the cell (0–8).
 * @param {number} c - Column index of the cell (0–8).
 * @returns {number[]} An array of valid candidate values (1–9).
 *                     Returns an empty array if the cell is already filled
 *                     or if no valid candidates exist.
 */
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

/**
 * Selects the next cell to fill using the MRV (Minimum Remaining Values) heuristic.
 *
 * The MRV heuristic chooses the empty cell with the smallest number of
 * valid candidate values, which significantly reduces the search space
 * during backtracking.
 *
 * @param {number[][]} grid - A 9×9 Sudoku grid.
 * @returns {{ r: number, c: number, cand: number[] } | { dead: true } | null}
 * - `{ r, c, cand }`: the chosen cell and its candidate values
 * - `{ dead: true }`: a contradiction was found (no candidates available)
 * - `null`: no empty cells remain (the grid is complete)
 */
function pickNextCellMRV(grid) {
  let best = null; // {r,c,cand}
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== 0) continue;
      const cand = getCandidates(grid, r, c);
      if (cand.length === 0) return { dead: true };
      if (!best || cand.length < best.cand.length) {
        best = { r, c, cand };
        if (cand.length === 1) return best; // can't do better than this
      }
    }
  }
  return best; // null if no empty cells
}


/**
 * Solves a Sudoku puzzle using backtracking and verifies solution uniqueness.
 *
 * The solver:
 * - Uses recursive backtracking
 * - Applies the MRV heuristic to reduce branching
 * - Counts the number of solutions
 * - Stops searching early if more than one solution is found
 *
 * During the search, statistics are collected to support
 * difficulty classification.
 *
 * @param {number[][]} inputGrid - A valid 9×9 Sudoku grid.
 * @returns {{
 *   solutions: number,
 *   unique: boolean,
 *   solved: boolean,
 *   solution: number[][] | null,
 *   stats: { nodes: number, guesses: number, maxDepth: number }
 * }}
 * An object containing the solution (if any), uniqueness information,
 * and solver statistics.
 */
function solveWithUniqueness(inputGrid) {
  const grid = cloneGrid(inputGrid);
  const stats = { nodes: 0, guesses: 0, maxDepth: 0 };
  let solutions = 0;
  let firstSolution = null;


  /**
   * Depth-first search with backtracking.
   *
   * @param {number} depth - Current recursion depth.
   */
  function dfs(depth) {
    stats.nodes++;
    if (depth > stats.maxDepth) stats.maxDepth = depth;
    
    // Early exit if multiple solutions are found
    if (solutions > 1) return;

    const pick = pickNextCellMRV(grid);
    if (pick && pick.dead) return;        // dead end due to contradiction
    // No empty cells left => one complete solution found
    if (!pick) {                         
      solutions++;
      if (solutions === 1) firstSolution = cloneGrid(grid);
      return;
    }

    const { r, c, cand } = pick;
    if (cand.length > 1) stats.guesses++;

    for (const v of cand) {
      grid[r][c] = v;
      dfs(depth + 1);
      grid[r][c] = 0;
      if (solutions > 1) return;
    }
  }

  dfs(0);

  return {
    solutions,
    unique: solutions === 1,
    solved: solutions >= 1,
    solution: firstSolution,
    stats,
  };
}

module.exports = { solveWithUniqueness };
