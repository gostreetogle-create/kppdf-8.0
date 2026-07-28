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

  console.log('=== Copy frontend build to browser dir ===');
  console.log(await run('cp -r /opt/kppdf-8.0/frontend/dist/kppdf-frontend/browser/* /opt/kppdf-8.0/frontend/browser/ 2>&1'));

  console.log('\n=== Verify files ===');
  console.log(await run('ls -la /opt/kppdf-8.0/frontend/browser/ 2>&1 | head -15'));

  console.log('\n=== Check index.html ===');
  console.log(await run('head -5 /opt/kppdf-8.0/frontend/browser/index.html 2>&1'));

  console.log('\n=== Test frontend ===');
  console.log(await run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>&1"));

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
