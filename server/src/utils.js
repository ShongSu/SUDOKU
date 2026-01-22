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

module.exports = { pickNextCellMRV, getCandidates };