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

  console.log('=== Test API login from server ===');
  console.log(await run('curl -sf -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d \'{"username":"admin","password":"admin-change-me-immediately-in-production"}\' 2>&1'));

  console.log('\n=== Check what IP/port is actually forwarded ===');
  console.log(await run('echo Tg30121986 | sudo -S iptables -t nat -L PREROUTING -n 2>&1'));

  console.log('\n=== Check Docker port mapping ===');
  console.log(await run('echo Tg30121986 | sudo -S docker port kppdf-backend 2>&1'));

  console.log('\n=== Check if anything else listens on port 80 ===');
  console.log(await run('ss -tlnp | grep ":80 " 2>&1'));

  console.log('\n=== Check nginx status ===');
  console.log(await run('echo Tg30121986 | sudo -S systemctl status nginx 2>&1 | head -5'));

  console.log('\n=== Check cloudflared status ===');
  console.log(await run('echo Tg30121986 | sudo -S systemctl status cloudflared 2>&1 | head -5'));

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '192.168.1.103', username: 'tiit', password: 'Tg30121986' });
