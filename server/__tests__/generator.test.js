const { getCandidates, pickNextCellMRV } = require("../sudoku/generator");

// helper: deep clone for safety in tests
const clone = (g) => g.map((r) => r.slice());

describe("getCandidates()", () => {
  test("returns [] if cell is already filled", () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    grid[0][0] = 5;
    expect(getCandidates(grid, 0, 0)).toEqual([]);
  });

  test("returns 1..9 when grid is empty and cell is empty", () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    expect(getCandidates(grid, 4, 4)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  test("excludes numbers already used in the same row", () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    grid[0][1] = 1;
    grid[0][2] = 3;
    grid[0][7] = 9;
    const cand = getCandidates(grid, 0, 0);
    expect(cand).not.toContain(1);
    expect(cand).not.toContain(3);
    expect(cand).not.toContain(9);
    expect(cand).toContain(2);
    expect(cand).toContain(4);
  });

  test("excludes numbers already used in the same column", () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    grid[1][0] = 2;
    grid[5][0] = 8;
    const cand = getCandidates(grid, 0, 0);
    expect(cand).not.toContain(2);
    expect(cand).not.toContain(8);
    expect(cand).toContain(1);
    expect(cand).toContain(9);
  });

  test("excludes numbers already used in the same 3x3 subgrid", () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    grid[1][1] = 4;
    grid[2][2] = 7;
    const cand = getCandidates(grid, 0, 0);
    expect(cand).not.toContain(4);
    expect(cand).not.toContain(7);
    expect(cand).toContain(1);
    expect(cand).toContain(9);
  });

  test("returns [] when no candidates exist (contradiction at that cell)", () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));

    for (let i = 1; i <= 8; i++) grid[0][i] = i;
    grid[1][0] = 9;

    expect(getCandidates(grid, 0, 0)).toEqual([]);
  });

  test("does not mutate the grid", () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    grid[0][1] = 1;
    const before = clone(grid);
    getCandidates(grid, 0, 0);
    expect(grid).toEqual(before);
  });
});

describe("pickNextCellMRV()", () => {
  test("returns null if there are no empty cells (grid complete)", () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(1)); // not a valid sudoku, but no empties
    expect(pickNextCellMRV(grid)).toBeNull();
  });

  test("returns {dead:true} if any empty cell has 0 candidates", () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));

    for (let i = 1; i <= 8; i++) grid[0][i] = i;
    grid[1][0] = 9;

    const res = pickNextCellMRV(grid);
    expect(res).toEqual({ dead: true });
  });

  test("picks a cell with exactly 1 candidate if exists (early return)", () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    for (let i = 1; i <= 8; i++) grid[0][i] = i;

    const pick = pickNextCellMRV(grid);
    expect(pick.dead).toBeUndefined();
    expect(pick.r).toBe(0);
    expect(pick.c).toBe(0);
    expect(pick.cand).toEqual([9]);
  });

  test("picks the cell with minimum remaining candidates (MRV)", () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    for (let i = 1; i <= 7; i++) grid[0][i] = i;

    const pick = pickNextCellMRV(grid);
    expect(pick.r).toBe(0);
    expect(pick.c).toBe(0);
    expect(pick.cand).toEqual([8, 9]);
  });

  test("tie-breaking: if multiple cells have same cand length, returns the first encountered in scan order", () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    
    const pick = pickNextCellMRV(grid);
    expect(pick.r).toBe(0);
    expect(pick.c).toBe(0); // first cell in row-major scan
    expect(pick.cand.length).toBe(9);
  });

  test("does not mutate the grid", () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    grid[0][1] = 1;
    const before = clone(grid);
    pickNextCellMRV(grid);
    expect(grid).toEqual(before);
  });
});
