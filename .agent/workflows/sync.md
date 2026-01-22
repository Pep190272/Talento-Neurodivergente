---
description: Sync local changes - commit, pull, merge, push safely
---

# Git Sync Workflow

This workflow safely syncs your local changes with the remote repository.

## Prerequisites
- You must be on a feature branch (NOT main or develop)
- All changes should be saved in your editor

## Steps

### 1. Check current branch and status
// turbo
```bash
git branch --show-current
git status --short
```
Verify you're NOT on `main` or `develop`. If you are, create a feature branch first:
```bash
git checkout -b feature/<your-name>/<description>
```

### 2. Stage all changes
// turbo
```bash
git add -A
```

### 3. Commit with a descriptive message
```bash
git commit -m "<type>: <description>"
```
Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`

### 4. Pull latest from develop (rebase to keep history clean)
// turbo
```bash
git pull origin develop --rebase
```
If conflicts occur, resolve them manually, then:
```bash
git add -A
git rebase --continue
```

### 5. Push your branch to remote
```bash
git push -u origin HEAD
```

### 6. (Optional) Create Pull Request
After pushing, go to GitHub and create a PR from your branch to `develop`.

---

## Quick One-Liner (for experienced users)
// turbo-all
```bash
git add -A; git commit -m "wip: checkpoint"; git pull origin develop --rebase; git push -u origin HEAD
```

## Notes
- NEVER force push to `main` or `develop`
- Always pull before pushing to avoid conflicts
- Use meaningful commit messages following Conventional Commits
