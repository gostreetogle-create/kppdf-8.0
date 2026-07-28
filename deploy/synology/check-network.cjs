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

  console.log('=== Check port binding ===');
  console.log(await run('ss -tlnp | grep :3000'));

  console.log('\n=== Test API from server ===');
  console.log(await run('curl -sf http://localhost:3000/api/health 2>&1'));

  console.log('\n=== Test API from Docker network ===');
  console.log(await run('curl -sf http://172.18.0.1:3000/api/health 2>&1'));

  console.log('\n=== Check CORS config ===');
  console.log(await run('cat /opt/kppdf-8.0/.env'));

  console.log('\n=== Check firewall ===');
  console.log(await run('echo Tg30121986 | sudo -S iptables -L -n | head -20 2>&1'));

  console.log('\n=== Check if port 3000 is open externally ===');
  console.log(await run('echo Tg30121986 | sudo -S ufw status 2>&1 || echo "ufw not found"'));

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
