# Student Grade Tracker

A web-based system that helps students manage their courses, assignments, and grades in one organized platform. The system enables users to track academic progress, monitor deadlines, and improve productivity.

## Table of Contents

- [Problem Statement](#problem-statement)
- [Proposed Solution](#proposed-solution)
- [Live Demo](#live-demo)
- [SRS Document](#srs-document)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [User Features](#user-features)
- [Author](#author)
- [License](#license)

## Problem Statement

Students often struggle with keeping track of assignments, deadlines, and course workloads. This leads to missed deadlines, poor time management, and decreased academic performance.

## Proposed Solution

The Student Grade Tracker provides a centralized platform where students can:

- Manage assignments and deadlines
- Track grades for each course
- Organize courses efficiently
- Update personal profile information
- Access the system easily through a clean and user-friendly UI

The system is designed according to the SRS document and mirrors the actors, processes, and use cases defined in the system design.

## Live Demo

Deployed Application: https://your-live-url-here.com

## SRS Document

Link to SRS: https://docs.google.com/document/d/1Y2QF7r1sLqnbP9aBfPJA2Ez1C0v3y2fABhh2vb_Jr_A/edit?tab=t.0#heading=h.128h5e7x87ps

## Technologies Used

**Frontend**

- React (Vite)
- TailwindCSS
- shadcn ui

**Backend**

- Node.js
- Express.js

**Database**

- MongoDB

## Setup Instructions

Follow these steps to run the project locally on your machine.

### A. Clone the Repository

```bash
git clone https://github.com/shina227/grade-tracker-summative.git
cd grade-tracker-summative
```

### B. Backend Setup

1. Navigate to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a .env file with the following variables:

```env
DATABASE_URL=your_postgres_database_url
JWT_SECRET=your_secret_key
PORT=5000
```

4. Start the backend server:

```bash
npm run dev
```

The backend will run at: http://localhost:5000

### C. Frontend Setup

1. Navigate to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a .env file:

```env
VITE_API_URL=http://localhost:5000
```

4. Start the frontend:

```bash
npm run dev
```

The frontend will run at: http://localhost:5173

## User Features

- Authentication
- Signup
- Login
- Logout
- Course Management
- Add/Edit/Delete courses
- Assignment Management
- Add/Edit/Delete assignments
- Search and filter assignments
- Automatic grade creation per assignment
- User Management
- Update profile (name, email)
- Change password
- View all grades

All features are implemented as defined in the SRS document.

## Author

Atete Mpeta Shina
Software Engineering Student - African Leadership University

## License

This project is for academic purposes.
