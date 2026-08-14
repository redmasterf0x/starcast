#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const commands = [
  {
    name: 'Backend (Express)',
    cmd: 'npm',
    args: ['start'],
    color: '\x1b[36m', // Cyan
  },
  {
    name: 'Frontend (Vite)',
    cmd: 'npm',
    args: ['run', 'dev'],
    color: '\x1b[35m', // Magenta
  },
];

console.log('\n🚀 Starting Starcast dev server with Netlify + Neon integration...\n');
console.log('   Backend (Express):  http://localhost:3001');
console.log('   Frontend (Vite):    http://localhost:5173');
console.log('   Magic Link Auth:    http://localhost:5173/first-time-login\n');
console.log('Press Ctrl+C to stop all processes.\n');

const processes = commands.map((config) => {
  const proc = spawn(config.cmd, config.args, {
    stdio: 'inherit',
    shell: true,
  });

  proc.on('error', (err) => {
    console.error(`${config.color}[${config.name}] Error:`, err.message, '\x1b[0m');
  });

  proc.on('close', (code) => {
    console.log(`${config.color}[${config.name}] Exited with code ${code}\x1b[0m`);
  });

  return proc;
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping all processes...');
  processes.forEach((proc) => {
    if (proc && !proc.killed) {
      proc.kill();
    }
  });
  process.exit(0);
});
