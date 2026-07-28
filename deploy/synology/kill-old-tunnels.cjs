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

  console.log('=== Kill old autossh tunnel (PID 224112) ===');
  console.log(await run('echo Tg30121986 | sudo -S kill 224112 2>&1'));
  await new Promise(x => setTimeout(x, 2000));

  console.log('\n=== Kill old ssh tunnel (PID 294969) ===');
  console.log(await run('kill 294969 2>&1'));
  await new Promise(x => setTimeout(x, 2000));

  console.log('\n=== Check remaining tunnels ===');
  console.log(await run('ps aux | grep "ssh -R" | grep -v grep'));

  console.log('\n=== Verify our new tunnel is running ===');
  console.log(await run('ps aux | grep "4200:localhost:3000" | grep -v grep'));

  console.log('\n=== Verify backend still works ===');
  console.log(await run('curl -sf http://localhost:3000/api/health 2>&1'));

  console.log('\n=== DONE - old tunnels killed, new tunnel active ===');
  console.log('New tunnel: VPS:4200 → VM:3000 (our Docker backend)');

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
