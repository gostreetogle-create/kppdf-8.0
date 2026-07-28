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

  console.log('=== MongoDB container logs ===');
  console.log(await run('echo Tg30121986 | sudo -S docker logs kppdf-mongo --tail=30 2>&1'));

  console.log('\n=== Docker inspect mongo ===');
  console.log(await run('echo Tg30121986 | sudo -S docker inspect kppdf-mongo --format "{{.State.Status}} {{.State.ExitCode}} {{.Config.Image}}" 2>&1'));

  console.log('\n=== Check mongo data dir ===');
  console.log(await run('ls -la /var/lib/kppdf80/mongodb/ 2>&1 | head -10'));

  console.log('\n=== Try removing old mongo container and recreate ===');
  console.log(await run('echo Tg30121986 | sudo -S docker rm -f kppdf-mongo 2>&1'));
  console.log(await run('echo Tg30121986 | sudo -S docker rm -f kppdf-80-mongo-init-1 2>&1'));

  console.log('\n=== Start mongo only ===');
  console.log(await run('cd /opt/kppdf-8.0 && echo Tg30121986 | sudo -S docker compose -f docker-compose.prod.yml up -d kppdf-mongo 2>&1'));

  console.log('\n=== Wait 10s ===');
  await new Promise(x => setTimeout(x, 10000));

  console.log('\n=== Mongo status ===');
  console.log(await run('docker ps -a --filter name=kppdf-mongo --format "{{.Names}}: {{.Status}}"'));

  console.log('\n=== Mongo logs after restart ===');
  console.log(await run('echo Tg30121986 | sudo -S docker logs kppdf-mongo --tail=15 2>&1'));

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
