#!/bin/bash

# run_15_fuzz_cycles.sh
# Executes the Jest Fuzzing test suite 15 times automatically.
# Stops execution immediately if any cycle fails.

echo "=========================================="
echo "Starting 15-Cycle Automated Fuzzing Engine"
echo "=========================================="

FAILURES=0

for i in {1..15}
do
   echo "[CYCLE $i/15] Injecting randomized seed and executing test suite..."

   # Set a random seed so the fuzz payload generator varies each loop
   export FUZZ_SEED=$RANDOM

   # We run only the fuzzing suite to isolate bugs rapidly
   npm run test -- tests/fuzz/core_fuzz.test.js --silent

   if [ $? -eq 0 ]; then
      echo "✅ Cycle $i Passed (Seed: $FUZZ_SEED)"
   else
      echo "❌ Cycle $i FAILED! (Seed: $FUZZ_SEED)"
      FAILURES=$((FAILURES+1))
      break # Stop immediately on failure so we can debug
   fi
done

if [ $FAILURES -eq 0 ]; then
   echo "=========================================="
   echo "🎉 All 15 Fuzzing Cycles Completed Successfully!"
   echo "=========================================="
   exit 0
else
   echo "=========================================="
   echo "🛑 Fuzzing halted due to failure on cycle $i."
   echo "Please review the stack trace above, patch the bug in src/, and re-run."
   echo "=========================================="
   exit 1
fi
