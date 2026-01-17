# Contributing to Qurato 🤝

Thanks for your interest in contributing to **Qurato**!
This project aims to turn YouTube into distraction-free learning experiences.

We welcome contributions of all kinds - bug fixes, features, UI improvements, and documentation.

---

## 🧠 Tech Stack

- **Next.js** (App Router)
- **TypeScript**
- **NextAuth** (Authentication)
- **Prisma** + **MongoDB**
- **Tailwind CSS**

Please be familiar with this stack before contributing.

---

## 🚀 Getting Started

### 1. Fork the Repository
Click the **Fork** button on GitHub and clone your fork:

```bash
git clone https://github.com/<your-username>/qurato.git
cd qurato
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables
Create a .env.local file using .env.example:

```bash
cp .env.example .env.local
```
Fill in required values (MongoDB, NextAuth, YouTube API).

### 4. Prisma Setup

```bash
npx prisma generate
```
(optional)

```bash
npx prisma db push
```

### 5. Run the Project

```bash
npm run dev
```
The app should now be running on http://localhost:3000.

---

## Branch Naming Convention

Create a new branch for every change: <br />
eg.

```text
feat/short-description
fix/short-description
ui/short-description
docs/short-description
```
eg.

```text
git checkout -b feat/course-progress
```

## Code Guidelines

- Use TypeScript strictly (no any unless justified)
- Follow existing folder structure
- Keep components small and readable
- No direct database queries inside client components
- Use server actions / API routes properly
- Avoid console logs in final PRs

## Commit Message Format

Use clear and descriptive commits:

```text
feat: add course progress tracking
fix: handle playlist pagination issue
ui: improve lecture sidebar design
```

## Pull Request Guidelines

Before opening a PR:
- Ensure the app runs locally
- Test your changes properly
- Keep PRs focused (one feature/fix per PR)

When opening a PR:
- Describe what and why
- Add screenshots for UI changes
- Link related issues if any

## Reporting Bugs

If you find a bug:
- Check existing issues first
- Provide clear steps to reproduce
- Add screenshots/logs if possible

## Legal & Policy Notes

- Qurato uses official YouTube APIs
- Do not add features that violate YouTube TOS

## Code of Conduct

- Be respectful and constructive.
- Harassment, spam, or low-effort PRs will be closed.

Thanks for contributing 💜 <br />
Let’s make learning distraction-free together.
