# smart-queue-backend

Backend service for the Smart Queue Management System.

## Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB (Running locally or via Atlas)
- pnpm (Preferred package manager)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

## Environment Setup

Create a `.env` file in the root directory based on `.env.example`. Ensure the following variables are set:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-queue
NODE_ENV=development
BCRYPT_SALT_ROUNDS=12
# Add other required variables from .env.example
```

## Running the Application

### Development Mode

To start the server with hot-reloading:

```bash
npm run dev
```

### Production Build

To build and start the production server:

```bash
npm run build
npm start
```

## Running Tests

This project uses **Jest** for integration testing.

### Run All Tests

To execute the full test suite (sequentially to ensure database isolation):

```bash
npm test
```

_Note: This command runs `NODE_ENV=test jest --runInBand`._

### Run Specific Tests

To run tests for a specific file:

```bash
# Example: Run user service tests
NODE_ENV=test npx jest tests/user.test.ts
```

### Test Coverage

The tests cover the following modules:

- Authentication (Login/Signup)
- User Service
- Service (Offering) Management
- Appointment Scheduling
- Staff Management
- Activity Logs
