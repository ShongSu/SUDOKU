# Sudoku Backend – Docker Compose Guide

This document explains how to run the **Sudoku backend API** using Docker Compose.
It is the **recommended way** to run the application for evaluation and local testing.

The frontend UI is optional and **not required** to run the backend.

---

## Prerequisites

- **Docker** (version 20+)
- **Docker Compose** (v2, included with Docker Desktop)

No Node.js or additional dependencies are required on your machine.

---

## Project Overview

The backend provides a REST API for:

- Parsing Sudoku puzzles from plain text
- Solving Sudoku puzzles
- Verifying solution uniqueness
- Classifying puzzle difficulty
- Generating new Sudoku puzzles with a unique solution

The application is implemented in **Node.js (Express)** and packaged as a Docker container.

---

## File Structure (Relevant)

```
.
├── Dockerfile
├── docker-compose.yml
├── server
│   ├── index.js
│   ├── sudoku/
│   └── tests/
└── README.md
```

---

## Run the Backend (Recommended)

From the root of the repository:

```bash
docker compose up --build
```

Docker Compose will:
1. Build the Docker image from the provided `Dockerfile`
2. Start the backend API container
3. Expose the service on port **4000**

---

## Access the API

Once running, the backend API is available at:

```
http://localhost:4000
```

---

## API Examples

### Health Check

**Endpoint**
```http
GET /health
```

**Response**
```json
{
  "ok": true
}
```

### Solve a Sudoku

**Endpoint**
```http
POST /api/solve
```

**Request body**
```json
{
  "text": "53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79"
}
```

**Response (example)**
```json
{
  "ok": true,
  "unique": true,
  "solved": true,
  "difficulty": {
    "level": "Medium",
    "score": 742
  }
}
```

---

### Generate a Sudoku

**Endpoint**
```http
GET /api/generate?level=Easy
```

Supported difficulty levels:
- `Easy`
- `Medium`
- `Hard`
- `Samurai`

---

## Stop the Application

Press `Ctrl + C` in the terminal, or run:

```bash
docker compose down
```

---

## Notes for Reviewers

- The backend is fully self-contained
- No database or external services are required
- Docker Compose is used to minimize setup effort
- The frontend UI (if present) is optional

---

## Summary

To run the backend:

```bash
docker compose up --build
```

That is all that is required to start the application.

---

## Quick Test with curl

The following examples allow reviewers to quickly verify the API without any additional tools.

### Health Check
```bash
curl http://localhost:4000/health
```

---

### Solve a Sudoku
```bash
curl -X POST http://localhost:4000/api/solve \
  -H "Content-Type: application/json" \
  -d '{
    "text": "53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79"
  }'
```

---

### Generate a Sudoku
```bash
curl "http://localhost:4000/api/generate?level=Easy"
```

Supported difficulty levels:
- Easy
- Medium
- Hard
- Samurai

---

### Solve Using a Text File (Optional)

Given a file `easy.txt`:

```txt
51.....83 
8..416..5 
......... 
.985.461.  
...9.1...  
.642.357.  
.........  
6..157..4  
78.....96
```

Use `perl` to safely convert line breaks into escaped `\n` characters
so the file content can be embedded into a JSON request body:

Run:
```bash
curl -X POST http://localhost:4000/api/solve \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"$(perl -0777 -pe 's/\n/\\n/g' ../examples/easy.txt)\"}"
```

## License

Provided for evaluation purposes.
