const { Client } = require('ssh2');
const fs = require('fs');
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

  console.log('=== Upload docker-compose.prod.yml ===');
  await new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      const content = fs.readFileSync('docker-compose.prod.yml', 'utf8');
      const ws = sftp.createWriteStream('/opt/kppdf-8.0/docker-compose.prod.yml');
      ws.on('close', resolve);
      ws.on('error', reject);
      ws.end(content);
    });
  });
  console.log('  [OK] docker-compose.prod.yml uploaded');

  console.log('\n=== Recreate backend ===');
  console.log(await run('cd /opt/kppdf-8.0 && echo Tg30121986 | sudo -S docker compose -f docker-compose.prod.yml up -d --force-recreate backend 2>&1 | tail -10'));

  console.log('\n=== Wait 25s ===');
  await new Promise(x => setTimeout(x, 25000));

  console.log('\n=== Containers ===');
  console.log(await run('docker ps --format "{{.Names}}: {{.Status}}"'));

  console.log('\n=== Health ===');
  console.log(await run('curl -sf http://localhost:3000/api/health 2>&1'));

  console.log('\n=== Frontend ===');
  console.log(await run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>&1"));

  console.log('\n=== Backend logs ===');
  console.log(await run('echo Tg30121986 | sudo -S docker logs kppdf-backend --tail=15 2>&1'));

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
