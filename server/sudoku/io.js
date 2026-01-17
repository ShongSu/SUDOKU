
/**
 * Parses a Sudoku puzzle from plain text into a 9×9 numeric grid.
 *
 * Expected input format:
 * - Exactly 9 lines
 * - Each line contains at least 9 characters
 * - Characters '1'–'9' represent filled cells
 * - Any other character (e.g. '.', '0', '*', or whitespace) represents an empty cell
 *
 * @param {string} text - Raw text content read from a Sudoku text file.
 * @returns {number[][]} A 9×9 grid where 0 represents an empty cell.
 * @throws {Error} If the input does not contain exactly 9 lines or
 *                 if any line has fewer than 9 characters.
 */

function parseGridFromText(text) {
  const lines = text.replace(/\r/g, "").trimEnd().split("\n");
  if (lines.length !== 9) throw new Error("Sudoku must have exactly 9 lines.");

  const grid = lines.map((line, r) => {
    if (line.length < 9) throw new Error(`Line ${r + 1} must have 9 characters.`);
    return Array.from(line.slice(0, 9)).map((ch) => {
      if (ch >= "1" && ch <= "9") return Number(ch);
      return 0; // treat any non-digit character as an empty cell
    });
  });
  return grid;
}

module.exports = { parseGridFromText };
