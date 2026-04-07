# One-Time Setup Guide (Do This Before Kickoff)

This guide walks you through the exact steps to set up full automation so Jules runs all 10 iterations without human intervention.

---

## Step 1: Create the GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Create a new **public** or **private** repository (e.g., `generic-product-finder`)
3. Upload the entire contents of this folder to the repository root
4. Make sure the structure looks like this:

```
/
├── .github/
│   └── workflows/
│       └── jules-auto-loop.yml      ← The automation engine
├── architecture/
│   ├── 01_system_overview.md        ← Ground Truth (22 files)
│   ├── 02a_source_modules_community.md
│   └── ... (all architecture docs)
├── JULES_START_HERE.md              ← Jules entry point
├── SYSTEM_STATE.md                  ← Progress tracker
├── ROADMAP.md                       ← 10-iteration plan
├── QA_PROTOCOL.md                   ← Quality gate rules
├── SETUP_GUIDE.md                   ← This file (delete after setup)
└── package.json                     ← Tech stack bootstrap
```

---

## Step 2: Configure GitHub Repository Settings
1. Go to your repo → **Settings** → **Actions** → **General**
2. Under "Workflow permissions", select **"Read and write permissions"**
3. Check **"Allow GitHub Actions to create and approve pull requests"**
4. Click **Save**

---

## Step 3: Add the Jules API Token as a GitHub Secret
1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Name: `JULES_API_TOKEN`
4. Value: Your Jules authentication token (get this from [jules.google](https://jules.google))
5. Click **"Add secret"**

---

## Step 4: Connect Jules to Your Repository
1. Go to [jules.google](https://jules.google)
2. Connect your GitHub account if you haven't already
3. Grant Jules access to the repository you just created

---

## Step 5: The Kickoff Command (The Only Manual Step)
Open a terminal and run:

```bash
npx @google/jules remote new --repo "YOUR_USERNAME/generic-product-finder" --session "Welcome to the repository. Please read JULES_START_HERE.md and execute your very first task. When complete, update SYSTEM_STATE.md and submit a Pull Request."
```

**Or**, go to the Jules web UI, select your repo, and type the prompt:
> "Welcome to the repository. Please read JULES_START_HERE.md and execute your very first task. When complete, update SYSTEM_STATE.md and submit a Pull Request."

---

## What Happens Next (Fully Automated)

```
You send kickoff prompt
        │
        ▼
Jules reads JULES_START_HERE.md + SYSTEM_STATE.md
        │
        ▼
Jules writes code for Iteration 1, Phase: Research
        │
        ▼
Jules opens a Pull Request
        │
        ▼
GitHub Actions runs tests automatically    ◄── jules-auto-loop.yml
        │
        ├── Tests FAIL → PR stays open (you get notified)
        │
        └── Tests PASS
                │
                ▼
        GitHub Actions auto-merges the PR
                │
                ▼
        GitHub Actions reads SYSTEM_STATE.md
                │
                ▼
        GitHub Actions triggers Jules CLI
        with the next iteration prompt
                │
                ▼
        Jules starts next phase...
                │
                ▼
        ♻️ LOOP REPEATS until Iteration 10 complete
```

---

## Safety Valves Built In
- **Test failures** break the loop. Jules' PR will sit unmerged until the tests pass.
- **Iteration 5 & 10** are Hard QA Audits. Jules will not write features — it will audit and refactor.
- **Iteration > 10** causes the pipeline to gracefully exit.

---

## Monitoring (Optional)
- **GitHub Actions tab**: Watch the pipeline in real time
- **Jules Dashboard**: [jules.google](https://jules.google) — see active sessions
- **Email/Slack**: GitHub sends PR notifications by default

---

*After completing this setup, you can delete this file from the repository.*
