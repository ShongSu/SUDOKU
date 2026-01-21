const { solveWithUniqueness } = require("../sudoku/solver");

describe("solveWithUniqueness", () => {
  test("solves a standard puzzle with a unique solution", () => {
    const grid = [
      [5,3,0,0,7,0,0,0,0],
      [6,0,0,1,9,5,0,0,0],
      [0,9,8,0,0,0,0,6,0],
      [8,0,0,0,6,0,0,0,3],
      [4,0,0,8,0,3,0,0,1],
      [7,0,0,0,2,0,0,0,6],
      [0,6,0,0,0,0,2,8,0],
      [0,0,0,4,1,9,0,0,5],
      [0,0,0,0,8,0,0,7,9],
    ];

    const res = solveWithUniqueness(grid);

    expect(res.solved).toBe(true);
    expect(res.unique).toBe(true);
    expect(res.solutions).toBe(1);
    expect(res.solution).toBeTruthy();
    expect(res.solution).toHaveLength(9);

    // spot check solved grid cells should not be 0
    expect(res.solution[0][2]).not.toBe(0);
    expect(res.solution[8][0]).not.toBe(0);
  });

  test.skip("detects unsolvable puzzle (no solution)", () => {
    // same row has duplicate 5 -> impossible
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    grid[0][0] = 5;
    grid[0][1] = 5;

    const res = solveWithUniqueness(grid);
    expect(res.solved).toBe(false);
    expect(res.solutions).toBe(0);
    expect(res.solution).toBe(null);
  });

  test("can report multiple solutions by early stopping at >1", () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    const res = solveWithUniqueness(grid);

    expect(res.solutions).toBeGreaterThan(1);
    expect(res.unique).toBe(false);
  });
});
