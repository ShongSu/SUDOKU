const { validateInitialGrid } = require("../sudoku/validate");

describe("validateInitialGrid", () => {
  test("accepts a valid partial grid", () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    grid[0][0] = 5;
    grid[0][1] = 3;
    grid[1][0] = 6;

    const v = validateInitialGrid(grid);
    expect(v.ok).toBe(true);
  });

  test("rejects row duplicate", () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    grid[0][0] = 5;
    grid[0][8] = 5;

    const v = validateInitialGrid(grid);
    expect(v.ok).toBe(false);
    expect(v.error).toMatch(/Row 1 has duplicate 5/);
  });

  test("rejects col duplicate", () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    grid[0][0] = 7;
    grid[8][0] = 7;

    const v = validateInitialGrid(grid);
    expect(v.ok).toBe(false);
    expect(v.error).toMatch(/Col 1 has duplicate 7/);
  });

  test("rejects box duplicate", () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    grid[0][0] = 9; // box 1
    grid[1][1] = 9; // same box 1

    const v = validateInitialGrid(grid);
    expect(v.ok).toBe(false);
    expect(v.error).toMatch(/Box 1 has duplicate 9/);
  });
});
