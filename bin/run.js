#!/usr/bin/env node

import { dirname } from 'path';
import { fileURLToPath } from 'url';

// ES modules fix for __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

// Register TS/TSX for development
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  await import('tsx/cjs');
}

import('../dist/index.js').then(m => m.default).catch(err => {
  console.error('Failed to start CLI:', err);
  process.exit(1);
}); 