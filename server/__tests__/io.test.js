const { parseGridFromText } = require("../sudoku/io");

describe("parseGridFromText", () => {
  test("parses 9x9 sudoku with '.' as empty", () => {
    const text =
      "53..7....\n" +
      "6..195...\n" +
      ".98....6.\n" +
      "8...6...3\n" +
      "4..8.3..1\n" +
      "7...2...6\n" +
      ".6....28.\n" +
      "...419..5\n" +
      "....8..79\n";

    const grid = parseGridFromText(text);

    expect(grid).toHaveLength(9);
    expect(grid[0]).toHaveLength(9);

    // spot checks
    expect(grid[0][0]).toBe(5);
    expect(grid[0][1]).toBe(3);
    expect(grid[0][2]).toBe(0);
    expect(grid[8][8]).toBe(9);
  });

  test("throws if not exactly 9 lines", () => {
    expect(() => parseGridFromText("123")).toThrow();
  });

  test("throws if a line has < 9 characters", () => {
    const bad =
      "12345678\n" + // 8 chars
      ".........\n".repeat(8);
    expect(() => parseGridFromText(bad)).toThrow();
  });
});
