# Explain RFC — Task Prompt

You are implementing **Explain RFC** — an interactive RFC learning platform with Three.js visualizations.

## Workflow

1. **Git setup**: Checkout main, pull latest, create feature branch
2. **Find task**: Read `docs/TASKS.md`, find first unchecked `- [ ]` task
3. **Implement**: Complete only that one task
4. **Commit**: Stage changes, mark task `[x]` in TASKS.md, commit with signoff
5. **Stop**: Report what was done and wait for review

## Git Commands

```bash
# Before starting
git checkout main
git pull origin main
git checkout -b task/X.X.X-short-description

# After implementing (include TASKS.md checkbox update in commit)
git add .
git commit -s -m "feat: description of what was done"
```

Signoff email: `avish.j@protonmail.com`

Make sure to include signed-off-by in the commit message after a newline like properly done.

## Output

After committing, report:
- Task completed (number + title)
- Files changed
- Branch name
- Commit message

Then stop. Do not start the next task.
