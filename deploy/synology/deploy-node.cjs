const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  host: '192.168.1.103',
  port: 22,
  username: 'tiit',
  password: 'Tg30121986',
  remoteDir: '/opt/kppdf-8.0',
  dataDir: '/var/lib/kppdf80',
  jwtSecret: '014fd3108b0a0142b212f4385464fa4cf29f041461cf04c9608c9fcfb4db0578',
  jwtRefresh: 'ceb70bc50ef132a421e536ff9bda8582387e073ca3f96dbfff3c4272a5298bba',
  corsOrigin: 'https://sport-set.ru',
};

const ARCHIVE = path.join(process.env.TEMP, 'kppdf-deploy.tar.gz');

function log(msg) { console.log('  ' + msg); }
function ok(msg) { console.log('  [OK] ' + msg); }
function fail(msg) { console.error('  [FAIL] ' + msg); process.exit(1); }

function runCommand(conn, cmd, timeout = 30) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, { pty: true }, (err, stream) => {
      if (err) return reject(err);
      let stdout = '', stderr = '';
      stream.on('data', (data) => { stdout += data.toString(); });
      stream.stderr.on('data', (data) => { stderr += data.toString(); });
      stream.on('close', (code) => {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code });
      });
    });
  });
}

function uploadFile(conn, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      // Ensure parent directory exists
      const remoteDir = path.dirname(remotePath);
      sftp.mkdir(remoteDir, { mode: 0o755 }, (mkdirErr) => {
        // Ignore EEXIST error (directory already exists)
        if (mkdirErr && mkdirErr.code !== 4) {
          log('mkdir warning: ' + mkdirErr.message);
        }
        const stat = fs.statSync(localPath);
        log(`Uploading ${(stat.size / 1024 / 1024).toFixed(1)} MB...`);
        const readStream = fs.createReadStream(localPath);
        const writeStream = sftp.createWriteStream(remotePath);
        writeStream.on('close', () => { ok('Upload complete'); resolve(); });
        writeStream.on('error', (e) => { log('SFTP write error: ' + e.message); reject(e); });
        readStream.pipe(writeStream);
      });
    });
  });
}

async function main() {
  console.log('');
  console.log('=== KPPDF 8.0 - Deploy to Production ===');
  console.log(`  Host: ${CONFIG.host}`);
  console.log(`  Remote: ${CONFIG.remoteDir}`);
  console.log('');

  if (!fs.existsSync(ARCHIVE)) {
    fail(`Archive not found: ${ARCHIVE}`);
  }

  const conn = new Client();

  await new Promise((resolve, reject) => {
    conn.on('ready', resolve);
    conn.on('error', reject);
    conn.connect({
      host: CONFIG.host,
      port: CONFIG.port,
      username: CONFIG.username,
      password: CONFIG.password,
    });
  });
  ok('Connected to server');

  // Step 1: Ensure remote dir exists (needs sudo for /opt/)
  log('Ensuring remote directory...');
  await runCommand(conn, `echo '${CONFIG.password}' | sudo -S mkdir -p ${CONFIG.remoteDir}`, 15);
  await runCommand(conn, `echo '${CONFIG.password}' | sudo -S chown -R ${CONFIG.username}:${CONFIG.username} ${CONFIG.remoteDir}`, 15);
  await runCommand(conn, `echo '${CONFIG.password}' | sudo -S mkdir -p ${CONFIG.dataDir}/mongodb ${CONFIG.dataDir}/uploads ${CONFIG.dataDir}/backups`, 15);
  await runCommand(conn, `echo '${CONFIG.password}' | sudo -S chown -R 999:999 ${CONFIG.dataDir}/mongodb`, 15);
  await runCommand(conn, `echo '${CONFIG.password}' | sudo -S chown -R ${CONFIG.username}:${CONFIG.username} ${CONFIG.dataDir}/uploads ${CONFIG.dataDir}/backups`, 15);
  ok('Directories ready (owned by tiit)');

  // Step 2: Upload archive
  log('Uploading archive...');
  await uploadFile(conn, ARCHIVE, `${CONFIG.remoteDir}/kppdf-deploy.tar.gz`);

  // Wait for file to be fully written
  await new Promise(r => setTimeout(r, 3000));

  // Step 3: Verify & Extract
  log('Verifying archive on server...');
  const lsResult = await runCommand(conn, `ls -la ${CONFIG.remoteDir}/kppdf-deploy.tar.gz 2>&1`);
  log(lsResult.stdout);

  log('Extracting archive...');
  const extractResult = await runCommand(conn,
    `cd ${CONFIG.remoteDir} && tar xzf kppdf-deploy.tar.gz && rm -f kppdf-deploy.tar.gz && echo "EXTRACT_OK"`,
    120
  );
  log('stdout: ' + extractResult.stdout.slice(-200));
  if (extractResult.stderr) log('stderr: ' + extractResult.stderr.slice(-200));
  if (!extractResult.stdout.includes('EXTRACT_OK') && extractResult.code !== 0) {
    fail('Extract failed (code ' + extractResult.code + ')');
  }
  ok('Extracted successfully');

  // Step 4: Write .env via SFTP
  log('Writing .env...');
  await new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      const envContent = [
        `JWT_SECRET=${CONFIG.jwtSecret}`,
        `JWT_REFRESH_SECRET=${CONFIG.jwtRefresh}`,
        `CORS_ORIGIN=${CONFIG.corsOrigin}`,
        `KPPDF_DATA_DIR=${CONFIG.dataDir}`,
      ].join('\n');
      const ws = sftp.createWriteStream(`${CONFIG.remoteDir}/.env`);
      ws.on('close', resolve);
      ws.on('error', reject);
      ws.end(envContent);
    });
  });
  ok('.env written via SFTP');

  // Step 5: Fix MongoDB permissions
  log('Fixing MongoDB permissions...');
  const chownResult = await runCommand(conn,
    `echo '${CONFIG.password}' | sudo -S chown -R 999:999 ${CONFIG.dataDir}/mongodb 2>&1`, 15);
  log(chownResult.stdout || 'done');
  ok('Permissions fixed');

  // Step 6: Docker build & up
  log('Docker build & start (this may take 10-15 minutes)...');
  log('Stopping old containers...');
  await runCommand(conn,
    `echo '${CONFIG.password}' | sudo -S docker compose -f ${CONFIG.remoteDir}/docker-compose.prod.yml down 2>/dev/null`, 60);

  log('Building backend image...');
  const buildResult = await runCommand(conn,
    `echo '${CONFIG.password}' | sudo -S docker compose -f ${CONFIG.remoteDir}/docker-compose.prod.yml build --no-cache backend 2>&1`,
    600
  );
  log('Build output: ' + buildResult.stdout.slice(-300));
  if (buildResult.stderr) log('Build errors: ' + buildResult.stderr.slice(-300));

  log('Starting containers...');
  const upResult = await runCommand(conn,
    `echo '${CONFIG.password}' | sudo -S docker compose -f ${CONFIG.remoteDir}/docker-compose.prod.yml up -d 2>&1`,
    120
  );
  log('Up output: ' + upResult.stdout.slice(-200));
  ok('Docker compose completed');

  // Step 7: Health check
  log('Waiting for backend...');
  let ready = false;
  for (let i = 0; i < 18; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const health = await runCommand(conn, 'curl -sf http://localhost:3000/api/health', 10);
    if (health.stdout.includes('ok') || health.stdout.includes('status')) {
      ok(`Backend ready! (${(i + 1) * 5}s)`);
      ready = true;
      break;
    }
    if (i % 3 === 2) console.log(`  Waiting... (${(i + 1) * 5}s)`);
  }

  if (!ready) {
    warn('Backend not ready within timeout');
  }

  // Verify
  const healthFinal = await runCommand(conn, 'curl -sf http://localhost:3000/api/health', 10);
  ok('Health: ' + healthFinal.stdout.slice(0, 100));

  const frontStatus = await runCommand(conn, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/", 10);
  if (frontStatus.stdout.includes('200')) {
    ok('Frontend: HTTP 200');
  } else {
    warn('Frontend: HTTP ' + frontStatus.stdout);
  }

  // Check containers
  const ps = await runCommand(conn, 'docker ps --format "{{.Names}}: {{.Status}}"');
  ok('Containers: ' + ps.stdout);

  conn.end();

  // Cleanup
  if (fs.existsSync(ARCHIVE)) fs.unlinkSync(ARCHIVE);

  console.log('');
  console.log('=== Deploy complete ===');
  console.log('');
  console.log(`  API:      http://${CONFIG.host}:3000/api/health`);
  console.log(`  Frontend: http://${CONFIG.host}:3000/`);
  console.log(`  Prod:     ${CONFIG.corsOrigin}`);
  console.log(`  Auth:     admin / admin-change-me-immediately-in-production`);
  console.log('');
}

function warn(msg) { console.log('  [WARN] ' + msg); }

main().catch(err => {
  console.error('Deploy failed:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});
