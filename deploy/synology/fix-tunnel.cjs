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

  console.log('=== Check SSH tunnels from VM ===');
  console.log(await run('ps aux | grep "ssh -R" | grep -v grep'));

  console.log('\n=== Kill old SSH tunnels ===');
  console.log(await run('echo Tg30121986 | sudo -S pkill -f "ssh -R" 2>&1'));
  await new Promise(x => setTimeout(x, 2000));

  console.log('\n=== Check if tunnel is gone ===');
  console.log(await run('ps aux | grep "ssh -R" | grep -v grep || echo "No tunnels running"'));

  console.log('\n=== Verify backend is running ===');
  console.log(await run('curl -sf http://localhost:3000/api/health 2>&1'));

  console.log('\n=== Set up new tunnel to VPS ===');
  console.log('Running: ssh -R 4200:localhost:3000 root@193.222.62.240 -N -o StrictHostKeyChecking=no');
  
  // Start tunnel in background
  conn.exec('ssh -R 4200:localhost:3000 root@193.222.62.240 -N -o StrictHostKeyChecking=no -o ServerAliveInterval=60 &', (err, stream) => {
    if (err) console.log('Tunnel error:', err.message);
    setTimeout(() => {
      console.log('\n=== Tunnel started (background) ===');
      console.log('=== Verify tunnel is working ===');
      run('ps aux | grep "ssh -R" | grep -v grep').then(r => console.log(r));
      conn.end();
      process.exit(0);
    }, 5000);
  });
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
