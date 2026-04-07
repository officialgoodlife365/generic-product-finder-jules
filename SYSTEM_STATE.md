# Current System State

> **JULES: This file is your short-term memory. Read it every time you start. Update it every time you finish a phase.**

---

**Current Iteration:** 1
**Total Iterations:** 10
**Current Phase:** Research

---

## Phase Cycle Reference
```
Research → Build → Test → QA Audit → [advance iteration] → Research → ...
```

## Update Rules
- When you complete **Research**, change phase to **Build**
- When you complete **Build**, change phase to **Test**
- When you complete **Test**, change phase to **QA Audit**
- When you complete **QA Audit**, change iteration to **N+1** and phase to **Research**
- When Iteration 10 QA Audit is complete, set iteration to **11** and phase to **COMPLETE**

## Completed Phases Log
*(Jules: append a line here after each PR)*

| Iteration | Phase | PR # | Notes |
|---|---|---|---|
| — | — | — | Pipeline not yet started |
