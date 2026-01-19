# Sudoku Solver & Generator

A full-stack Sudoku application that can **read, solve, validate, generate, and classify Sudoku puzzles**, with a simple **React-based UI** and a **Node.js backend**.

This project is designed as a technical assessment and demonstrates:
- Algorithm design (backtracking, MRV heuristic)
- Uniqueness verification
- Difficulty classification
- Puzzle generation
- Clean API design
- Simple but usable frontend UI

---

## Project Structure

```
SUDOKU/
├── client/                 # React frontend (CRA)
│   ├── public/             # Static assets (example .txt puzzles)
│   ├── src/                # React source code
│   ├── package.json
│   └── README.md
│
├── server/                 # Node.js / Express backend
│   ├── __tests__/          # Jest tests
│   ├── sudoku/             # Core Sudoku logic
│   │   ├── solver.js       # Solve + uniqueness check
│   │   ├── generator.js    # Puzzle generator
│   │   ├── difficulty.js   # Difficulty classification
│   │   └── validator.js    # Input validation
│   ├── index.js            # Express entry point
│   ├── package.json
│   └── README.md
│
├── examples/               # Sample Sudoku text files
├── README.md               # ← You are here
└── Requirement.txt         # Assignment description
```

---

## Features

### Backend (Node.js)
- Read Sudoku puzzles from plain text files (9×9 format)
- Validate initial grid (rows, columns, 3×3 boxes)
- Solve Sudoku using backtracking + MRV heuristic
- Detect **unique vs multiple solutions**
- Collect solving statistics:
  - visited nodes
  - guesses
  - max recursion depth
- Classify difficulty:
  - Easy / Medium / Hard / Samurai
- Generate Sudoku puzzles with:
  - Unique solution
  - Optional 3×3 symmetry
  - Approximate difficulty target

### Frontend (React)
- Upload `.txt` Sudoku files to populate the puzzle
- Manually edit puzzle text
- Visual 9×9 grid with:
  - 3×3 subgrid shading
  - Thick subgrid borders
- Solve puzzle on demand
- Highlight solver-filled numbers in **blue**
- Generate new puzzles by difficulty
- Display puzzle, solution, and statistics

---

## Sudoku File Format

Each puzzle is defined as **9 lines × 9 characters**:

- `1–9` → fixed numbers
- `.` or any other character → empty cell

Example:
```
53..7....
6..195...
.98....6.
8...6...3
4..8.3..1
7...2...6
.6....28.
...419..5
....8..79
```

---

## Getting Started

### Backend Setup

```bash
cd server
npm install
npm start
```

Backend runs on:

```
http://localhost:4000
```

---

### Frontend Setup

```bash
cd client
npm install
npm start
```

Frontend runs on:

```
http://localhost:3000
```

The React app uses a proxy to communicate with the backend, so API calls are made via `/api/...`.

---

## 🔌 API Endpoints

### Solve a Sudoku
```http
POST /api/solve
Content-Type: application/json
```

Request body:
```json
{
  "text": "53..7....\n6..195...\n..."
}
```

---

### Generate a Sudoku
```http
GET /api/generate?level=Medium&symmetry=true
```

Query parameters:
- `level`: Easy | Medium | Hard | Samurai
- `symmetry`: true / false

---

## Difficulty Classification

Difficulty is estimated based on solver behavior rather than human tactics.

Current heuristic:
```
score = visited_nodes + guesses × weight
```

Thresholds:
| Level    | Score Range |
|---------|-------------|
| Easy    | < 300       |
| Medium  | < 1000      |
| Hard    | < 5000      |
| Samurai | ≥ 5000      |

---

## Testing

Backend unit tests are written with **Jest**.

```bash
cd server
npm test
```

---

## Technology Stack

- **Frontend**: React (Create React App)
- **Backend**: Node.js, Express
- **Testing**: Jest
- **Algorithms**: Backtracking, MRV heuristic
- **Language**: JavaScript (ES6)

---

## License

Provided for practive and evaluation purposes.
