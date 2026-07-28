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

  console.log('=== Full backend logs ===');
  console.log(await run('echo Tg30121986 | sudo -S docker logs kppdf-backend 2>&1'));

  console.log('\n=== Rebuild backend with no cache ===');
  console.log(await run('cd /opt/kppdf-8.0 && echo Tg30121986 | sudo -S docker compose -f docker-compose.prod.yml build --no-cache backend 2>&1 | tail -50'));

  console.log('\n=== Restart backend ===');
  console.log(await run('echo Tg30121986 | sudo -S docker compose -f /opt/kppdf-8.0/docker-compose.prod.yml up -d --force-recreate backend 2>&1'));

  console.log('\n=== Wait 15s ===');
  await new Promise(x => setTimeout(x, 15000));

  console.log('\n=== Backend logs after rebuild ===');
  console.log(await run('echo Tg30121986 | sudo -S docker logs kppdf-backend --tail=30 2>&1'));

  console.log('\n=== Health ===');
  console.log(await run('curl -sf http://localhost:3000/api/health 2>&1'));

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
