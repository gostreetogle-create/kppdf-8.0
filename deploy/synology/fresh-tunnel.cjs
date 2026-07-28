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

  console.log('=== Verify tunnel is working by checking VPS ===');
  console.log(await run('curl -sf http://localhost:3000/api/health 2>&1'));

  console.log('\n=== Kill ALL ssh processes and start fresh ===');
  console.log(await run('echo Tg30121986 | sudo -S pkill -f "ssh -R" 2>&1'));
  console.log(await run('echo Tg30121986 | sudo -S pkill -f autossh 2>&1'));
  await new Promise(x => setTimeout(x, 3000));

  console.log('\n=== Verify all tunnels killed ===');
  console.log(await run('ps aux | grep -E "ssh -R|autossh" | grep -v grep || echo "All tunnels killed"'));

  console.log('\n=== Start fresh tunnel with autossh ===');
  // Use nohup to keep tunnel alive
  console.log(await run('nohup ssh -R 4200:localhost:3000 root@193.222.62.240 -N -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes > /dev/null 2>&1 &'));
  await new Promise(x => setTimeout(x, 5000));

  console.log('\n=== Verify new tunnel ===');
  console.log(await run('ps aux | grep "ssh -R" | grep -v grep'));

  console.log('\n=== Verify backend ===');
  console.log(await run('curl -sf http://localhost:3000/api/health 2>&1'));

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
