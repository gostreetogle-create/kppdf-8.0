const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', async () => {
  const run = (cmd) => new Promise((resolve) => {
    conn.exec(cmd, { pty: true }, (err, stream) => {
      let out = '';
      stream.on('data', (d) => { out += d.toString(); });
      stream.stderr.on('data', (d) => { out += d.toString(); });
      stream.on('close', () => resolve(out));
    });
  });

  console.log('=== Kill old kppdf-3.0 process ===');
  console.log(await run('echo Tg30121986 | sudo -S kill 284957 2>&1'));
  await new Promise(x => setTimeout(x, 2000));

  console.log('\n=== Kill PM2 process ===');
  console.log(await run('echo Tg30121986 | sudo -S kill 223744 2>&1'));
  await new Promise(x => setTimeout(x, 2000));

  console.log('\n=== Kill all old node processes (except our Docker) ===');
  console.log(await run('echo Tg30121986 | sudo -S pkill -f "/home/tiit/kppdf" 2>&1'));
  console.log(await run('echo Tg30121986 | sudo -S pkill -f "pm2" 2>&1'));
  await new Promise(x => setTimeout(x, 2000));

  console.log('\n=== Check remaining processes ===');
  console.log(await run('ps aux | grep node | grep -v grep'));

  console.log('\n=== Check ports ===');
  console.log(await run('ss -tlnp | grep -E ":3000 |:4200 "'));

  console.log('\n=== Verify our Docker is still running ===');
  console.log(await run('docker ps --format "{{.Names}}: {{.Status}}"'));

  console.log('\n=== Test API ===');
  console.log(await run('curl -sf http://localhost:3000/api/health 2>&1'));

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
