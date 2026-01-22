const express = require("express");
const { parseGridFromText } = require("./src/io");
const { validateInitialGrid } = require("./src/validate");
const { solveWithUniqueness } = require("./src/solver");
const { classifyDifficulty } = require("./src/difficulty");
const { generateSudoku } = require("./src/generator");

const fs = require("fs");
const path = require("path");
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 },
}); // 1MB

// const easyText = fs.readFileSync(
//   path.join(__dirname, "..", "examples", "easy.txt"),
//   "utf8"
// );

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_, res) => res.json({ ok: true }));

// Upload a .txt file and solve it
// app.post("/api/solve-file", upload.single("file"), (req, res) => {
//   try {
//     if (!req.file)
//       return res.status(400).json({ ok: false, error: "No file uploaded." });

//     const text = req.file.buffer.toString("utf-8");
//     const grid = parseGridFromText(text);

//     const v = validateInitialGrid(grid);
//     if (!v.ok) return res.status(400).json(v);

//     const result = solveWithUniqueness(grid);

//     return res.json({
//       ok: true,
//       input: grid,
//       ...result,

//       difficulty: classifyDifficulty(result.stats),
//     });
//   } catch (e) {
//     return res
//       .status(400)
//       .json({ ok: false, error: e?.message || "Bad request" });
//   }
// });

app.post("/api/solve", (req, res) => {
  try {
    const grid = parseGridFromText(req.body.text);

    const v = validateInitialGrid(grid);
    if (!v.ok) return res.status(400).json(v);

    const result = solveWithUniqueness(grid);
    return res.json({
      ok: true,
      input: grid,
      ...result,
      difficulty: classifyDifficulty(result.stats), // todo
    });
  } catch (e) {
    return res
      .status(400)
      .json({ ok: false, error: e?.message || "Bad request" });
  }
});

/**
 * Quick test endpoint for generating a Sudoku via GET.
 * Example:
 *   http://localhost:4000/api/generate?level=Hard&symmetry=true
 */
app.get("/api/generate", (req, res) => {
  try {
    const targetLevel = req.query.level || "Medium";
    const symmetry = req.query.symmetry !== "false"; // 默认 true

    const result = generateSudoku({
      targetLevel,
      symmetry,
    });

    return res.json({
      ok: true,
      puzzle: result.puzzle,
      solution: result.solution,
      givens: result.givens,
      blanks: result.blanks,
      difficulty: result.difficulty,
      stats: result.stats,
    });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: e?.message || "Failed to generate Sudoku",
    });
  }
});

const PORT = 4000;
app.listen(PORT, "0.0.0.0", () => console.log(`Listening: ${PORT}`));
module.exports = app;
