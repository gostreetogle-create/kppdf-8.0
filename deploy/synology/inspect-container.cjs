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

  console.log('=== Check image layers ===');
  console.log(await run('echo Tg30121986 | sudo -S docker images kppdf-80-backend --format "{{.ID}} {{.CreatedAt}}"'));

  console.log('\n=== Inspect new container CMD ===');
  console.log(await run('echo Tg30121986 | sudo -S docker inspect kppdf-backend --format "{{.Config.Cmd}}" 2>&1'));

  console.log('\n=== List /app/dist in container ===');
  console.log(await run('echo Tg30121986 | sudo -S docker exec kppdf-backend ls -la /app/dist/ 2>&1'));

  console.log('\n=== Check if dist/src exists ===');
  console.log(await run('echo Tg30121986 | sudo -S docker exec kppdf-backend ls -la /app/dist/src/ 2>&1'));

  console.log('\n=== Check /app structure ===');
  console.log(await run('echo Tg30121986 | sudo -S docker exec kppdf-backend find /app -name "main.js" 2>&1'));

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
