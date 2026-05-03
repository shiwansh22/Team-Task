# 🚀 Team Task Manager

A full-stack web application for managing team projects and tasks with role-based access control.

---

## 📌 Overview

This application allows teams to:

* Create and manage projects
* Assign and track tasks
* Monitor progress through a dashboard
* Control access using Admin and Member roles

Built as part of a full-stack assessment.

---

## ⚙️ Tech Stack

* React + TypeScript (Vite)
* Tailwind CSS
* Firebase (Authentication + Firestore)
* React Router
* Vercel (Deployment)

---

## 🔐 Features

### Authentication

* User Signup & Login
* Secure authentication using Firebase

### Role-Based Access

* Admin: Manage projects, tasks, and team
* Member: Work on assigned tasks

### Project Management

* Create and view projects
* Add team members

### Task Management

* Create and assign tasks
* Update task status (TODO / IN_PROGRESS / DONE)

### Dashboard

* View task statistics
* Track progress and overdue tasks

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd team-task-manager
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

### 4. Run the app

```bash
npm run dev
```

---

## 🌐 Deployment

Deployed using Vercel.

---

## 🛡️ Notes

* Environment variables are not included for security reasons
* Firebase configuration must be added locally or in deployment settings

---

