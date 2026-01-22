const { pickNextCellMRV } = require("./utils");

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
