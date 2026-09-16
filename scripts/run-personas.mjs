#!/usr/bin/env node
import { spawn } from 'node:child_process';
const child = spawn('npx', ['playwright', 'test', 'tests/personas.spec.ts', '--reporter=html'], { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 1));
