#!/usr/bin/env node
import { run } from '@oclif/core';

const main = async () => {
  await run();
};

main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
}); 