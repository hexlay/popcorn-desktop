'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');

let hookPath;
try {
  hookPath = execFileSync('git', ['rev-parse', '--git-path', 'hooks/pre-commit'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore']
  }).trim();
} catch (error) {
  console.log('Skipping pre-commit hook installation outside a Git checkout.');
  process.exit(0);
}

if (!path.isAbsolute(hookPath)) {
  hookPath = path.join(root, hookPath);
}

const hook = `#!/usr/bin/env node
'use strict';

const path = require('path');
const { spawnSync } = require('child_process');

const root = process.cwd();
const gulp = process.platform === 'win32' ? 'gulp.cmd' : 'gulp';
const result = spawnSync(path.join(root, 'node_modules', '.bin', gulp), ['pre-commit'], {
  cwd: root,
  stdio: 'inherit'
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status === null ? 1 : result.status);
`;

fs.mkdirSync(path.dirname(hookPath), { recursive: true });
fs.writeFileSync(hookPath, hook, { mode: 0o755 });
fs.chmodSync(hookPath, 0o755);
console.log(`Installed pre-commit hook at ${hookPath}`);
