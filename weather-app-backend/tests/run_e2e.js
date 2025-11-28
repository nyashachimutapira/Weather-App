const { spawn, exec } = require('child_process');
const axios = require('axios');

const SERVER_PORT = process.env.E2E_PORT || 5030;
const BASE = `http://localhost:${SERVER_PORT}`;
const SERVER_START_TIMEOUT = 15000;

console.log('E2E runner: starting server with MOCK_WEATHER=true on port', SERVER_PORT);

const serverEnv = Object.assign({}, process.env, { MOCK_WEATHER: 'true', PORT: String(SERVER_PORT) });
const server = spawn('node', ['server.js'], { cwd: __dirname + '/..', env: serverEnv, stdio: ['ignore', 'pipe', 'pipe'] });

server.stdout.on('data', (d) => process.stdout.write(`[server] ${d}`));
server.stderr.on('data', (d) => process.stderr.write(`[server:err] ${d}`));

let serverReady = false;
const start = Date.now();

async function waitForServer() {
  while (Date.now() - start < SERVER_START_TIMEOUT) {
    try {
      const res = await axios.get(`${BASE}/api/weather/current`, { params: { city: 'Test' }, timeout: 2000 });
      if (res.status === 200) {
        serverReady = true;
        return true;
      }
    } catch (e) {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function runTests() {
  console.log('E2E runner: waiting for server to be ready...');
  const ok = await waitForServer();
  if (!ok) {
    console.error('Server did not become ready in time. Killing process.');
    server.kill('SIGTERM');
    process.exit(2);
  }
  console.log('Server ready — running tests against', BASE);

  const env = Object.assign({}, process.env, { BASE_URL: BASE });
  const child = exec('node tests/test.js', { cwd: __dirname + '/..', env, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
    console.log(stdout);
    if (stderr) console.error(stderr);
    if (err) {
      console.error('Tests failed:', err.message);
      server.kill('SIGTERM');
      process.exit(err.code || 1);
    } else {
      console.log('E2E tests passed');
      server.kill('SIGTERM');
      process.exit(0);
    }
  });
}

process.on('SIGINT', () => { server.kill('SIGTERM'); process.exit(130); });
process.on('exit', () => { if (!server.killed) server.kill('SIGTERM'); });

runTests();
