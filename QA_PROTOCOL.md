# The Quality Assurance Protocol

> **JULES: This protocol is MANDATORY during Iterations 5 and 10. You are forbidden from writing new features during these iterations.**

---

## Your Role During QA
You are no longer an engineer. You are a **strict QA auditor**. Your job is to find problems, not create features.

---

## The Audit Checklist

### 1. Architectural Compliance Audit
For EVERY source file in `src/`:
- Open the corresponding architecture document in `/architecture/`
- Verify that the code faithfully implements what the document describes
- Flag any code that exists but has NO corresponding requirement in the architecture docs
- Flag any architecture requirement that has NO corresponding code implementation
- **Action:** Delete code that contradicts or has no basis in the architecture. Add TODO comments for missing implementations.

### 2. Hallucination Detection
Check for the following red flags:
- [ ] npm packages that are not required by the architecture or standard Node.js development
- [ ] Functions or classes that solve problems not described in any architecture file
- [ ] API endpoints that don't map to the `16_app_architecture.md` specification
- [ ] Database tables or columns not defined in `15a` or `15b` schema documents
- [ ] Hardcoded values that should be environment variables
- **Action:** Remove all hallucinated code. Document what you removed and why.

### 3. Test Integrity Audit
- [ ] Run `npm test` — ALL tests must pass
- [ ] Review each test file: does each test verify a REAL requirement from the architecture?
- [ ] Delete any test that validates hallucinated functionality
- [ ] Add tests for any untested architecture requirements
- [ ] Verify test coverage is meaningful (not just "does it not crash?")
- **Action:** Fix failing tests by fixing the code, NOT by modifying the test expectations.

### 4. Code Quality Review
- [ ] No duplicated logic across modules
- [ ] Consistent error handling patterns
- [ ] No console.log statements in production code (use a proper logger)
- [ ] All database queries use parameterized inputs (no SQL injection risk)
- [ ] All API keys and secrets use environment variables via dotenv
- [ ] No circular dependencies between modules

### 5. Dependency Hygiene
- [ ] Run a conceptual audit of `package.json` — is every dependency actually used?
- [ ] Remove unused dependencies
- [ ] Ensure no deprecated packages are in use

---

## QA Report Output

Create a file: `qa_reports/QA_REPORT_ITERATION_X.md` (replace X with the iteration number)

The report MUST contain:

```markdown
# QA Report — Iteration X

## Summary
- Total files audited: __
- Issues found: __
- Issues fixed: __
- Tests passing: __/__

## Architectural Compliance
| Architecture File | Status | Notes |
|---|---|---|
| 01_system_overview.md | ✅ Compliant / ⚠️ Partial / ❌ Non-compliant | Details |
| ... | ... | ... |

## Hallucinations Removed
| File | What Was Removed | Reason |
|---|---|---|
| ... | ... | Not in architecture |

## Test Results
- Total tests: __
- Passing: __
- Failing: __
- Tests removed (hallucinated): __
- Tests added (missing coverage): __

## Code Quality Fixes
| Fix | File | Description |
|---|---|---|
| ... | ... | ... |

## Verdict
[ ] PASS — System is architecturally compliant and ready for next iteration
[ ] FAIL — Critical issues remain (list them below)
```

---

## After QA Completion
1. Commit all fixes and the QA report
2. Update `SYSTEM_STATE.md` — advance to the next iteration with phase "Research"
3. Submit your Pull Request

**Remember: If you find yourself wanting to add a new feature during QA, STOP. That is a hallucination. You are an auditor, not an engineer, during this phase.**
