# Current System State

> **JULES: This file is your short-term memory. Read it every time you start. Update it every time you finish a phase.**

---

**Current Iteration:** 1
**Total Iterations:** 10
**Current Phase:** Research

---

## Phase Cycle Reference
```
Research → Build → Test → [advance iteration] → Research → ...
Exception: Iteration 5 and 10 → phase is "QA" (follow QA_PROTOCOL.md)
```

## Update Rules
- When you complete **Research**, change phase to **Build**
- When you complete **Build**, change phase to **Test**
- When you complete **Test**, change iteration to **N+1** and phase to **Research**
- Exception: If the new iteration is **5** or **10**, set phase to **QA**
- When Iteration 10 QA is complete, set iteration to **11** and phase to **COMPLETE**

## Completed Phases Log
*(Jules: append a line here after each PR)*

| Iteration | Phase | PR # | Notes |
|---|---|---|---|
| — | — | — | Pipeline not yet started |
