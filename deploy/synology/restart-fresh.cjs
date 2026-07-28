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

  console.log('=== Stop ALL containers ===');
  console.log(await run('echo Tg30121986 | sudo -S docker stop $(docker ps -aq) 2>/dev/null; echo Tg30121986 | sudo -S docker rm $(docker ps -aq) 2>/dev/null; echo DONE'));

  console.log('\n=== Check port 3000 ===');
  console.log(await run('ss -tlnp | grep :3000 || echo "Port 3000 free"'));

  console.log('\n=== Start full stack ===');
  console.log(await run('cd /opt/kppdf-8.0 && echo Tg30121986 | sudo -S docker compose -f docker-compose.prod.yml up -d 2>&1'));

  console.log('\n=== Wait 30s for boot ===');
  await new Promise(x => setTimeout(x, 30000));

  console.log('\n=== Container status ===');
  console.log(await run('docker ps --format "{{.Names}}: {{.Status}}"'));

  console.log('\n=== Health check ===');
  console.log(await run('curl -sf http://localhost:3000/api/health 2>&1'));

  console.log('\n=== Frontend ===');
  console.log(await run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>&1"));

  console.log('\n=== Backend logs ===');
  console.log(await run('echo Tg30121986 | sudo -S docker logs kppdf-backend --tail=20 2>&1'));

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
