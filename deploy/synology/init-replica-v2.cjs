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

  console.log('=== Create init script on server ===');
  await new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      const script = `rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo:27017" }
  ]
})`;
      const ws = sftp.createWriteStream('/tmp/init-replica.js');
      ws.on('close', resolve);
      ws.on('error', reject);
      ws.end(script);
    });
  });
  console.log('  [OK] Script uploaded');

  console.log('\n=== Run init script ===');
  console.log(await run('echo Tg30121986 | sudo -S docker cp /tmp/init-replica.js kppdf-mongo:/tmp/init-replica.js 2>&1'));
  console.log(await run('echo Tg30121986 | sudo -S docker exec kppdf-mongo mongo /tmp/init-replica.js 2>&1'));

  console.log('\n=== Wait 5s ===');
  await new Promise(x => setTimeout(x, 5000));

  console.log('\n=== Check status ===');
  console.log(await run('echo Tg30121986 | sudo -S docker exec kppdf-mongo mongo --eval "rs.status().ok" 2>&1'));

  console.log('\n=== Restart backend ===');
  console.log(await run('echo Tg30121986 | sudo -S docker restart kppdf-backend 2>&1'));

  console.log('\n=== Wait 30s ===');
  await new Promise(x => setTimeout(x, 30000));

  console.log('\n=== Health ===');
  console.log(await run('curl -sf http://localhost:3000/api/health 2>&1'));

  console.log('\n=== Frontend ===');
  console.log(await run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>&1"));

  console.log('\n=== Backend logs ===');
  console.log(await run('echo Tg30121986 | sudo -S docker logs kppdf-backend --tail=10 2>&1'));

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
