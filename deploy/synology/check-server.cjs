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

  console.log('=== Docker build logs (last 100 lines) ===');
  const logs = await run('cd /opt/kppdf-8.0 && echo Tg30121986 | sudo -S docker compose -f docker-compose.prod.yml build --no-cache backend 2>&1 | tail -100');
  console.log(logs);

  console.log('\n=== Container status ===');
  const ps = await run('docker ps -a --format "{{.Names}}: {{.Status}}"');
  console.log(ps);

  console.log('\n=== Backend logs ===');
  const blog = await run('echo Tg30121986 | sudo -S docker logs kppdf-backend --tail=30 2>&1');
  console.log(blog);

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
