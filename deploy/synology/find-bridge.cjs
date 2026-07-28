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

  console.log('=== Try SSH to bridge server (193.222.62.240) ===');
  console.log(await run('ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no tiit@193.222.62.240 "echo OK" 2>&1 || echo "SSH to bridge failed"'));

  console.log('\n=== Try SSH with different users ===');
  console.log(await run('ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no root@193.222.62.240 "echo OK" 2>&1 || echo "SSH root@bridge failed"'));
  console.log(await run('ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no nastiit@193.222.62.240 "echo OK" 2>&1 || echo "SSH nastiit@bridge failed"'));

  console.log('\n=== Check if Synology has nginx/portal ===');
  console.log(await run('curl -sf --connect-timeout 5 http://192.168.1.1:5000/ 2>&1 | head -5 || echo "Synology NAS web UI not reachable"'));

  console.log('\n=== Check routes from VM ===');
  console.log(await run('ip route show'));

  console.log('\n=== Try ping bridge ===');
  console.log(await run('ping -c 2 -W 3 193.222.62.240 2>&1'));

  console.log('\n=== Check Synology host ===');
  console.log(await run('arp -a | head -10'));

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
