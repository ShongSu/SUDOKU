import React, { useState } from "react";
import "./App.css";

function parseGridFromTextClient(text) {
  console.log()
  const lines = text.replace(/\r/g, "").trimEnd().split("\n");
  if (lines.length !== 9) throw new Error("Sudoku must have exactly 9 lines.");

  return lines.map((line, r) => {
    if (line.length < 9)
      throw new Error(`Line ${r + 1} must have 9 characters.`);
    return Array.from(line.slice(0, 9)).map((ch) => {
      if (ch >= "1" && ch <= "9") return Number(ch);
      return 0;
    });
  });
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsText(file);
  });
}

const DEFAULT_TEXT = 
  "51.....83\n" +
  "8..416..5\n" +
  ".........\n" +
  ".985.461.\n" +
  "...9.1...\n" +
  ".642.357.\n" +
  ".........\n" +
  "6..157..4\n" +
  "78.....96\n";

function toText(grid) {
  if (!grid) return "";
  return grid
    .map((row) => row.map((v) => (v === 0 ? "." : String(v))).join(""))
    .join("\n");
}
function Grid({ grid, baseGrid }) {
  if (!grid) return <div className="muted">No grid</div>;

  return (
    <div className="grid">
      {grid.flat().map((v, i) => {
        const r = Math.floor(i / 9);
        const c = i % 9;

        // 3×3 box
        const box = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        const boxAlt = box % 2 === 0 ? "boxA" : "boxB";

        // if filled from an original 0 in baseGrid
        const isFilled =
          baseGrid && baseGrid[r] && baseGrid[r][c] === 0 && v !== 0;

        const thickLeft = c === 3 || c === 6 ? "thickLeft" : "";
        const thickTop = r === 3 || r === 6 ? "thickTop" : "";

        return (
          <div
            key={i}
            className={[
              "cell",
              boxAlt,
              v === 0 ? "empty" : "",
              isFilled ? "filled" : "given",
              thickLeft,
              thickTop,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {v === 0 ? "" : v}
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("solve");

  // Solve
  const [text, setText] = useState(DEFAULT_TEXT);
  const [solveResult, setSolveResult] = useState(null);
  const [solveLoading, setSolveLoading] = useState(false);
  const [solveError, setSolveError] = useState("");
  const [puzzleGrid, setPuzzleGrid] = useState(null);

  // Generate
  const [level, setLevel] = useState("Medium");
  const [symmetry, setSymmetry] = useState(true);
  const [genResult, setGenResult] = useState(null);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState("");

  async function handleSolve() {
    setSolveLoading(true);
    setSolveError("");
    setSolveResult(null);
    try {
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Solve failed");
      setSolveResult(data);
    } catch (e) {
      setSolveError(e.message || "Solve failed");
    } finally {
      setSolveLoading(false);
    }
  }

  async function handleGenerate() {
    setGenLoading(true);
    setGenError("");
    setGenResult(null);
    try {
      // GET /api/generate?level=...&symmetry=...
      const url = `/api/generate?level=${encodeURIComponent(
        level
      )}&symmetry=${encodeURIComponent(String(symmetry))}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Generate failed");
      setGenResult(data);
    } catch (e) {
      setGenError(e.message || "Generate failed");
    } finally {
      setGenLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="title">Sudoku UI</div>
        <div className="tabs">
          <button
            className={tab === "solve" ? "active" : ""}
            onClick={() => setTab("solve")}
          >
            Solve
          </button>
          <button
            className={tab === "generate" ? "active" : ""}
            onClick={() => setTab("generate")}
          >
            Generate
          </button>
        </div>
      </header>

      {tab === "solve" && (
        <div className="content">
          <div className="panel">
            <div className="panelTitle">
              Input (9 lines, 9 chars; use '.' for empty)
            </div>
            <textarea
              className="textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
            />
            <div className="row">
              <input
                type="file"
                accept=".txt,text/plain"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setSolveError("");
                  setSolveResult(null);

                  try {
                    const content = await readFileAsText(file);
                    setText(content);

                    const g = parseGridFromTextClient(content);
                    setPuzzleGrid(g);
                  } catch (err) {
                    setPuzzleGrid(null);
                    setSolveError(err.message || "Invalid Sudoku file.");
                  } finally {
                    e.target.value = "";
                  }
                }}
              />
              <span className="hint">Upload .txt (9 lines × 9 chars)</span>
            </div>
            <div className="row">
              <button onClick={handleSolve} disabled={solveLoading}>
                {solveLoading ? "Solving..." : "Solve"}
              </button>
              <button
                onClick={() => {
                  setText(DEFAULT_TEXT);
                  setSolveResult(null);
                  setSolveError("");
                }}
                disabled={solveLoading}
              >
                Reset
              </button>
            </div>
            {solveError && <div className="error">{solveError}</div>}
          </div>

          <div className="right">
            <div className="panel">
              <div className="panelTitle">Result Info</div>
              {solveResult ? (
                <div className="kv">
                  <div>Unique:</div>
                  <div>{String(solveResult.unique)}</div>
                  <div>Solutions:</div>
                  <div>{solveResult.solutions}</div>
                  <div>Difficulty:</div>
                  <div>
                    {solveResult.difficulty?.level} (score{" "}
                    {solveResult.difficulty?.score})
                  </div>
                  <div>Nodes:</div>
                  <div>{solveResult.stats?.nodes}</div>
                  <div>Guesses:</div>
                  <div>{solveResult.stats?.guesses}</div>
                  <div>MaxDepth:</div>
                  <div>{solveResult.stats?.maxDepth}</div>
                </div>
              ) : (
                <div className="muted">Run solve to see results.</div>
              )}
            </div>
              <div className="panel">
                <div className="panelTitle">Puzzle Grid (from file/text)</div>
                <Grid grid={puzzleGrid || null} />
              </div>
            <div className="panel">
              <div className="panelTitle">Solution Grid</div>

              <Grid
                grid={solveResult?.solution || null}
                baseGrid={solveResult?.input || null}
              />{" "}
            </div>

            {solveResult?.solution && (
              <div className="panel">
                <div className="panelTitle">Solution (text)</div>
                <pre className="pre">{toText(solveResult.solution)}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "generate" && (
        <div className="content">
          <div className="panel">
            <div className="panelTitle">Generate Settings</div>

            <div className="row">
              <label className="label">
                Level:
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                  <option>Samurai</option>
                </select>
              </label>

              <label className="label">
                Symmetry:
                <input
                  type="checkbox"
                  checked={symmetry}
                  onChange={(e) => setSymmetry(e.target.checked)}
                />
              </label>
            </div>

            <div className="row">
              <button onClick={handleGenerate} disabled={genLoading}>
                {genLoading ? "Generating..." : "Generate"}
              </button>
            </div>

            {genError && <div className="error">{genError}</div>}

            {level === "Samurai" && (
              <div className="hint">
                If Samurai fails often, try symmetry=false.
              </div>
            )}
          </div>

          <div className="right">
            <div className="panel">
              <div className="panelTitle">Generated Info</div>
              {genResult ? (
                <div className="kv">
                  <div>Difficulty:</div>
                  <div>
                    {genResult.difficulty?.level} (score{" "}
                    {genResult.difficulty?.score})
                  </div>
                  <div>Givens:</div>
                  <div>{genResult.givens}</div>
                  <div>Blanks:</div>
                  <div>{genResult.blanks}</div>
                  <div>Nodes:</div>
                  <div>{genResult.stats?.nodes}</div>
                  <div>Guesses:</div>
                  <div>{genResult.stats?.guesses}</div>
                </div>
              ) : (
                <div className="muted">Click Generate to create a puzzle.</div>
              )}
            </div>

            <div className="panel">
              <div className="panelTitle">Puzzle</div>
              <Grid grid={genResult?.puzzle || null} />
            </div>

            <div className="panel">
              <div className="panelTitle">Solution (returned by API)</div>
              <Grid grid={genResult?.solution || null} baseGrid={genResult?.input || null} />
            </div>

            {genResult?.puzzle && (
              <div className="panel">
                <div className="panelTitle">Puzzle (text)</div>
                <pre className="pre">{toText(genResult.puzzle)}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
