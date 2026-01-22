/**
 * Classifies the difficulty level of a Sudoku puzzle based on solver statistics.
 *
 * The difficulty is estimated using a simple, explainable heuristic derived
 * from the solving process:
 * - `nodes` represents the number of search nodes visited during backtracking
 * - `guesses` represents the number of branching decisions (cells with multiple candidates)
 *
 * A weighted score is computed as:
 *   score = nodes + guesses × 50
 *
 * Higher scores indicate a larger search space and more ambiguity, and therefore
 * a higher difficulty level.
 *
 * Note:
 * This is an approximate, algorithm-based difficulty classification rather than
 * a simulation of human solving techniques. The thresholds are chosen to be
 * intuitive and adjustable based on empirical testing.
 *
 * @param {{ nodes: number, guesses: number, maxDepth: number }} stats
 * Solver statistics collected during the solving process.
 *
 * @returns {{ level: "Easy" | "Medium" | "Hard" | "Samurai", score: number }}
 * An object containing the difficulty level and the computed score.
 */

function classifyDifficulty(stats) {
  // more search nodes and guesses imply higher difficulty
  const score = stats.nodes + stats.guesses * 50;

  if (score < 300) return { level: "Easy", score };
  if (score < 1000) return { level: "Medium", score };
  if (score < 5000) return { level: "Hard", score };
  return { level: "Samurai", score };
}

module.exports = { classifyDifficulty };
