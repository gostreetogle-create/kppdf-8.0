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

  console.log('=== Connected to bridge server ===');
  console.log(await run('hostname'));
  console.log(await run('cat /etc/os-release | head -3'));

  console.log('\n=== Find nginx config ===');
  console.log(await run('find /etc/nginx -name "*.conf" 2>/dev/null'));
  console.log(await run('ls /etc/nginx/sites-enabled/ 2>/dev/null'));
  console.log(await run('ls /etc/nginx/conf.d/ 2>/dev/null'));

  console.log('\n=== Show nginx proxy_pass config ===');
  console.log(await run('nginx -T 2>/dev/null | grep -B2 -A5 "proxy_pass"'));

  console.log('\n=== Show full nginx config for kppdf ===');
  console.log(await run('cat /etc/nginx/sites-enabled/* 2>/dev/null || cat /etc/nginx/conf.d/*.conf 2>/dev/null'));

  console.log('\n=== Check nginx status ===');
  console.log(await run('systemctl status nginx 2>/dev/null | head -10'));

  console.log('\n=== Check listening ports ===');
  console.log(await run('ss -tlnp | grep -E ":80 |:443 "'));

  conn.end();
  process.exit(0);
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

conn.connect({ host: '193.222.62.240', username: 'root', password: 'Tg30121986' });
