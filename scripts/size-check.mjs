#!/usr/bin/env node
// Fails the build if the embed bundle exceeds the Amplenote plugin budget.
import { statSync } from 'fs';
import { resolve } from 'path';

const target = resolve(process.cwd(), 'sandbox/plugin/plugin.iife.js');
const HARD_LIMIT_KB = 260;
const SOFT_LIMIT_KB = 220;

try {
  const bytes = statSync(target).size;
  const kb = bytes / 1024;
  console.log(`bundle: ${kb.toFixed(1)} KB`);
  if (kb > HARD_LIMIT_KB) {
    console.error(`FAIL: bundle ${kb.toFixed(1)} KB exceeds hard limit ${HARD_LIMIT_KB} KB`);
    process.exit(2);
  }
  if (kb > SOFT_LIMIT_KB) {
    console.warn(`WARN: bundle ${kb.toFixed(1)} KB exceeds soft limit ${SOFT_LIMIT_KB} KB`);
  }
} catch (e) {
  console.error('size-check: bundle not found at', target);
  process.exit(1);
}
