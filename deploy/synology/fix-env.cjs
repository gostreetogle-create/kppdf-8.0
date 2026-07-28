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

  console.log('=== Upload fixed .env ===');
  await new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      const envContent = [
        'JWT_SECRET=014fd3108b0a0142b212f4385464fa4cf29f041461cf04c9608c9fcfb4db0578',
        'JWT_REFRESH_SECRET=ceb70bc50ef132a421e536ff9bda8582387e073ca3f96dbfff3c4272a5298bba',
        'CORS_ORIGIN=https://sport-set.ru',
        'KPPDF_DATA_DIR=/var/lib/kppdf80',
        'ADMIN_PASSWORD=admin-change-me-immediately-in-production',
      ].join('\n');
      const ws = sftp.createWriteStream('/opt/kppdf-8.0/.env');
      ws.on('close', resolve);
      ws.on('error', reject);
      ws.end(envContent);
    });
  });
  console.log('  [OK] .env updated');

  console.log('\n=== Restart backend ===');
  console.log(await run('echo Tg30121986 | sudo -S docker compose -f /opt/kppdf-8.0/docker-compose.prod.yml restart backend 2>&1'));

  console.log('\n=== Wait 20s ===');
  await new Promise(x => setTimeout(x, 20000));

  console.log('\n=== Container status ===');
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
