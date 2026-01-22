# Sudoku Solver & Generator

This project is a **full‑stack Sudoku application** consisting of:

- A **Node.js backend API** for solving and generating Sudoku puzzles
- A **React frontend** for visualization and manual interaction
- Optional **Docker Compose** setup for easy backend execution
- **GitHub Actions CI/CD** for automated deployment to AWS

The project is designed to be easy to run locally for evaluation, while also
demonstrating production‑ready deployment practices.

---

## Project Overview

### Backend (Node.js / Express)
- Parse Sudoku puzzles from plain text
- Solve puzzles and verify uniqueness
- Classify difficulty based on solving complexity
- Generate new puzzles with a unique solution
- Exposes a REST API

### Frontend (React)
- Upload Sudoku puzzle files
- Visualize puzzles and solutions
- Highlight auto‑filled values
- Trigger solve/generate operations via API

---

## Project Structure

```
├── client/                 # React frontend (CRA)
│   ├── public/             # Static assets (example .txt puzzles)
│   ├── src/                # React source code
│   ├── package.json
│   └── README.md
├── server/                 # Node.js backend
│   ├── index.js
│   ├── src/
│   └── __tests__/
├── examples/               # Sample Sudoku text files
├── Dockerfile              # Backend Docker image
├── docker-compose.yml      # Backend Docker Compose setup
├── README-backend-docker-compose.md
└── README.md               # (this file)
```

---

## Quick start ##  

If you prefer not to run the project locally, you can view a fully working
production deployment on AWS at the link below:

https://d31p3xd2k0i2c7.cloudfront.net/

Local setup instructions are provided below.

---

## Running the Frontend (Local Development)

The frontend is optional and provided mainly for visualization and manual testing.

### Prerequisites
- Node.js 18+
- npm

### Steps

```bash
cd client
npm install
npm start
```

The React application will be available at:

```
http://localhost:3000
```

The frontend expects the backend API to be available at:

```
http://localhost:4000
```

---

## Running the Backend

You can run the backend **either locally** or **using Docker Compose**.

---

### Option 1: Run Backend Locally (Without Docker)

#### Prerequisites
- Node.js 18+
- npm

```bash
cd server
npm install
npm start
```

The API will start on:

```
http://localhost:4000
```

---

### Option 2: Run Backend with Docker Compose (Recommended)

Docker Compose provides the most reliable way to run the backend without
installing Node.js dependencies locally.

```bash
docker compose up --build
```

The backend API will be available at:

```
http://localhost:4000
```

📄 **Detailed Docker Compose instructions and curl examples**  
See: [README-backend-docker-compose.md](./README-backend-docker-compose.md)

---

## Troubleshooting Local Setup

If you encounter issues running the project locally (e.g. environment
differences, dependency conflicts, or platform-specific issues), you may
refer to the production deployment below. This deployment represents a
known working configuration of both the frontend and backend:

https://d31p3xd2k0i2c7.cloudfront.net/

---

## Production Deployment (AWS)

This project is deployed on AWS using the following services:

- **Frontend**: S3 + CloudFront
- **Backend**: ECS Fargate + Application Load Balancer
- **Images**: Amazon ECR

The frontend and backend are served under the same CloudFront domain,
with `/api/*` requests proxied to the backend.

---

## CI/CD with GitHub Actions

The repository includes a GitHub Actions workflow that automatically deploys
changes when code is pushed to the `main` branch.

### CI/CD Responsibilities

- Build the React frontend
- Upload frontend assets to S3
- Invalidate CloudFront cache
- Build backend Docker image
- Push image to Amazon ECR
- Register a new ECS task definition revision
- Perform a rolling update of the ECS service

### Authentication

- GitHub Actions uses **AWS OIDC**
- No long‑lived AWS credentials are stored
- Access is restricted to this repository and branch

### Trigger

```text
git push origin main
```

This will automatically deploy the latest frontend and backend changes.

---

## Notes for Reviewers

- The backend API can be run independently via Docker Compose
- The frontend is optional and not required for evaluation
- No database or external dependencies are required
- Sample Sudoku input files are provided under `examples/`

---

## Notes for Reviewers

- The backend API can be run independently via Docker Compose
- The frontend is optional and not required for evaluation
- No database or external dependencies are required
- Sample Sudoku input files are provided under `examples/`

---

## Future Work

### 1. Infrastructure as Code (IaC)
- Design and codify the initial infrastructure architecture.
- Introduce **Terraform** to manage AWS resources (e.g. S3, CloudFront, ECR, ECS, IAM) in a declarative and reproducible way.
- Improve infrastructure consistency, auditability, and environment parity.

### 2. Environment-aware CI/CD with GitHub Actions
- Currently, the CI/CD pipeline is triggered **only on pushes to the `main` branch**.
- Introduce **separate environments**:
  - **Dev environment**
    - Every push to the `dev` branch triggers deployment to the dev environment.
  - **Production environment**
    - Deployment is triggered **only on release (tag-based)**, not on every push.
- This better reflects real-world deployment practices and reduces production risk.

### 3. Selective Builds for Frontend and Backend
- Currently, every push triggers a **full build** for both frontend and backend.
- Optimize by:
  - Splitting workflows for frontend and backend
  - Detecting file changes and building only affected components
- This will significantly reduce CI execution time and resource usage.

### 4. More Accurate Sudoku Difficulty Classification
- Current difficulty classification is based on **solver algorithm complexity**.
- This may not always align with **human-perceived difficulty**.
- Future improvements include:
  - Incorporating human-solving heuristics
  - Combining multiple metrics (e.g. technique depth, branching factor)
- This will provide a more realistic difficulty rating.

### 5. Improved UI Feedback for Invalid Sudoku Input
- Currently, invalid Sudoku input is shown via a **generic error message**.
- Planned UI enhancements:
  - Highlight conflicting numbers directly on the grid (e.g. red cells)
  - Provide clearer visual feedback for faster error identification
- This will improve usability and overall user experience.

---

## Summary

- **Backend**: Node.js API (local or Docker Compose)
- **Frontend**: React (local development)
- **Deployment**: AWS + GitHub Actions
- **Focus**: Clean API design, algorithm correctness, and production‑ready workflows

---

## License

Provided for evaluation purposes.
