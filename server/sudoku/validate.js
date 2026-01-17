/**
 * Validates the initial state of a Sudoku grid.
 *
 * This function performs defensive validation before solving:
 * 1. Ensures the grid is a 9×9 two-dimensional array
 * 2. Ensures all cell values are integers in the range 0–9
 *    - 0 represents an empty cell
 *    - 1–9 represent filled cells
 * 3. Verifies that no Sudoku rules are violated:
 *    - No duplicate numbers in any row
 *    - No duplicate numbers in any column
 *    - No duplicate numbers in any 3×3 subgrid
 *
 * The function does NOT attempt to solve the puzzle; it only checks
 * whether the given grid is a valid starting configuration.
 *
 * @param {number[][]} grid - A 9×9 Sudoku grid where 0 represents an empty cell.
 * @returns {{ ok: true } | { ok: false, error: string }}
 * An object indicating whether the grid is valid.
 * If invalid, the `error` field contains a descriptive message.
 */
function validateInitialGrid(grid) {
  if (!Array.isArray(grid) || grid.length !== 9) return { ok: false, error: "Grid must be 9 rows." };
  for (let r = 0; r < 9; r++) {
    if (!Array.isArray(grid[r]) || grid[r].length !== 9) return { ok: false, error: `Row ${r + 1} must be 9 cols.` };
    for (let c = 0; c < 9; c++) {
      const v = grid[r][c];
      if (!Number.isInteger(v) || v < 0 || v > 9) return { ok: false, error: `Invalid value at (${r + 1},${c + 1}).` };
    }
  }

  // Conflict check
  const seenRow = Array.from({ length: 9 }, () => new Set());
  const seenCol = Array.from({ length: 9 }, () => new Set());
  const seenBox = Array.from({ length: 9 }, () => new Set());

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = grid[r][c];
      if (v === 0) continue;
      // Map (r,c) to 0–8 subgrid(box) number
      const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      if (seenRow[r].has(v)) return { ok: false, error: `Row ${r + 1} has duplicate ${v}.` };
      if (seenCol[c].has(v)) return { ok: false, error: `Col ${c + 1} has duplicate ${v}.` };
      if (seenBox[b].has(v)) return { ok: false, error: `Box ${b + 1} has duplicate ${v}.` };
      seenRow[r].add(v); seenCol[c].add(v); seenBox[b].add(v);
    }
  }

  return { ok: true };
}

module.exports = { validateInitialGrid };
