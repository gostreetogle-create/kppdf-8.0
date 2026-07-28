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

  console.log('=== Our IP addresses ===');
  console.log(await run('ip addr show | grep "inet "'));

  console.log('\n=== Can we reach 193.222.62.240 from VM? ===');
  console.log(await run('curl -sf --connect-timeout 5 http://193.222.62.240/ 2>&1 || echo "Cannot reach WAN"'));

  console.log('\n=== What does 193.222.62.240 see? ===');
  console.log(await run('curl -sf --connect-timeout 5 http://193.222.62.240/api/health 2>&1 || echo "WAN health check failed"'));

  console.log('\n=== Check if bridge server is separate ===');
  console.log(await run('hostname -I'));

  console.log('\n=== Is nginx on THIS machine? ===');
  console.log(await run('which nginx 2>/dev/null && nginx -v 2>&1 || echo "nginx NOT installed on this machine"'));

  console.log('\n=== Check external IP from VM ===');
  console.log(await run('curl -sf --connect-timeout 5 ifconfig.me 2>&1 || echo "Cannot get external IP"'));

  console.log('\n=== Docker network inspect ===');
  console.log(await run('docker network inspect bridge --format "{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{println}}{{end}}" 2>&1'));

  console.log('\n=== Try reaching port 3000 from external IP ===');
  console.log(await run('curl -sf --connect-timeout 5 http://193.222.62.240:3000/api/health 2>&1 || echo "Port 3000 via WAN failed"'));

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
