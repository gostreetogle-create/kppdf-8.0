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

  console.log('=== ALL backend logs ===');
  console.log(await run('echo Tg30121986 | sudo -S docker logs kppdf-backend 2>&1'));

  console.log('\n=== Check health endpoint directly ===');
  console.log(await run('echo Tg30121986 | sudo -S docker exec kppdf-backend curl -sf http://localhost:3000/api/health 2>&1'));

  console.log('\n=== Check what port backend listens on ===');
  console.log(await run('echo Tg30121986 | sudo -S docker exec kppdf-backend netstat -tlnp 2>&1 || echo "netstat not found"'));

  console.log('\n=== Container inspect ===');
  console.log(await run('echo Tg30121986 | sudo -S docker inspect kppdf-backend --format "{{.State.Status}} {{.State.ExitCode}} {{.Config.Env}}" 2>&1'));

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
