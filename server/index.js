const express = require("express");
const { parseGridFromText } = require("./sudoku/io");
const { validateInitialGrid } = require("./sudoku/validate");

const fs = require("fs");
const path = require("path");

const easyText = fs.readFileSync(
  path.join(__dirname, "..", "examples", "easy.txt"),
  "utf8"
);

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_, res) => res.json({ ok: true }));

app.get("/api/grid", (req, res) => {
  try {
    const grid = parseGridFromText(easyText); 
    console.log("easyText",easyText);
    console.log("validateInitialGrid",typeof validateInitialGrid);
    

    const v = validateInitialGrid(grid);
    if (!v.ok) return res.status(400).json(v);

    return res.json({ ok: true, grid });
  } catch (e) {
    return res.status(400).json({ ok: false, error: e?.message || "Bad request" });
  }
});


// Part3 生成接口（之后再实现）
// app.post("/api/generate", (req,res)=>{})

const PORT = 3000;
app.listen(PORT, () => console.log(`API running: http://localhost:${PORT}`));
module.exports = app;